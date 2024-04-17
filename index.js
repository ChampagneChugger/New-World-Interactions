import SteamUser from "steam-user"

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"

const client = new SteamUser()

client.logOn({ accountName: "marioxxz", password: "Vortex123!" })

client.on("loggedOn", () => {
    console.log("LOGGED ON")

    client.setPersona(SteamUser.EPersonaState.Online)
    client.gamesPlayed(1063730)

    client.createAuthSessionTicket(1063730, async (err, sessionTicket) => {
        const ticket = sessionTicket.toString("hex")

        login(ticket)
    })
})

async function login(ticket) {
    const tokenService = await fetch("https://tokenservice.amazongames.com/games/new-world/tokens", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "new-world",
            "Accept-Language": "hr-HR"
        },
        body: JSON.stringify({
            "platformAuth": {
                "ticket": ticket
            },
            "platformType": "steam"
        })
    })

    const { accessToken } = await tokenService.json()

    const credentials = await fetch("https://d1w0bfy6smo4d1.cloudfront.net/prod/credentials/omni", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })

    const { accessKeyId, secretAccessKey, sessionToken } = await credentials.json()

    const loginInfo = await fetch("https://d1w0bfy6smo4d1.cloudfront.net/prod/game/getlogininfo/jwt/omni?channelId=STEAM_APP_ID.1063730&includeNames=false", {
        method: "GET",
        headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "User-Agent": "aws-sdk-cpp/1.7.193 Windows/10.0.22621.3374 AMD64 MSVC/1929",
            "x-nw-auth": accessToken
        }
    })

    const { LoginInfoList } = await loginInfo.json()
    const { Worlds } = LoginInfoList

    for (const world of Worlds) {
        if (world.WorldStatus == "ACTIVE") {
            console.log(world)
        }
    }
}

// username validation
// https://18.66.17.48/prod/game/worlds/1fd8ddcd-1d24-4a7b-86c4-c2633dc1aa89/characters/validator/jwt/omni?channelId=STEAM_APP_ID.1063730

// character creation
// https://18.66.17.48/prod/game/worlds/1fd8ddcd-1d24-4a7b-86c4-c2633dc1aa89/characters/jwt/omni?channelId=STEAM_APP_ID.1063730