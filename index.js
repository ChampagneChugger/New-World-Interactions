import SteamUser from "steam-user"
import "dotenv/config"

// Disable Node TLS unauthorized packet rejection
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"

// Create a new steam client
const client = new SteamUser()

// Login to steam with your credentials
client.logOn({ accountName: process.env.account_name, password: process.env.account_password })

client.on("loggedOn", () => {
    // Set your account status to online
    client.setPersona(SteamUser.EPersonaState.Online)
    // Set your game played as New World
    client.gamesPlayed(1063730)

    // You need AuthSessionTicket in order to generate a token for New World services
    client.createAuthSessionTicket(1063730, async (err, sessionTicket) => {
        // Convert buffer data to a hex string
        const ticket = sessionTicket.toString("hex")

        // Initialize the main function
        login(ticket)
    })
})

async function login(ticket) {
    // Generate a steam access token for New World interactions
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

    // Extract the accessToken from the response
    const { accessToken } = await tokenService.json()

    /* NOT NEEDED FOR THIS - START */

    const credentials = await fetch("https://d1w0bfy6smo4d1.cloudfront.net/prod/credentials/omni", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })

    const { accessKeyId, secretAccessKey, sessionToken } = await credentials.json()

    /* NOT NEEDED FOR THIS - END */

    // Get all the data that the client usually requests
    const loginInfo = await fetch("https://d1w0bfy6smo4d1.cloudfront.net/prod/game/getlogininfo/jwt/omni?channelId=STEAM_APP_ID.1063730&includeNames=false", {
        method: "GET",
        headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "User-Agent": "aws-sdk-cpp/1.7.193 Windows/10.0.22621.3374 AMD64 MSVC/1929",
            "x-nw-auth": accessToken
        }
    })

    // Extract LoginInfoList from the request
    const { LoginInfoList } = await loginInfo.json()

    // Extract Worlds from LoginInfoList - this is a list off all previously and current active servers including they info
    const { Worlds } = LoginInfoList

    for (const world of Worlds) {
        // Display active worlds, there is more info included in each world, such as player count, queue, etc.
        if (world.WorldStatus == "ACTIVE") {
            console.log(world)
        }
    }
}

// username validation
// https://18.66.17.48/prod/game/worlds/1fd8ddcd-1d24-4a7b-86c4-c2633dc1aa89/characters/validator/jwt/omni?channelId=STEAM_APP_ID.1063730

// character creation
// https://18.66.17.48/prod/game/worlds/1fd8ddcd-1d24-4a7b-86c4-c2633dc1aa89/characters/jwt/omni?channelId=STEAM_APP_ID.1063730

/* MINDMAP
1fd8ddcd-1d24-4a7b-86c4-c2633dc1aa89 - kronos
*/