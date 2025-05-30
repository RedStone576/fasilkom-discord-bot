import "dotenv/config"
import { Client, Message } from "oceanic.js"

const prefix = "p!"

const client = new Client({ 
    auth: `Bot ${process.env.TOKEN}`,
    gateway: {
        intents: [
            "ALL_NON_PRIVILEGED",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT",
        ]
    }
})

client.on("ready", async () => console.log("Logged in as", client.user.tag))
client.on("error", async (err) => console.error("Something Broke!", err))

//example
const commands: Record<string, any> = {
    ping: {
        run: (message: Message, args: Array<string>) =>
        {
            message.channel!.createMessage({ content: "pong" })
        } 
    },

    say: {
        run: (message: Message, args: Array<string>) =>
        {
            message.channel!.createMessage({ content: args.join(" ") })
        }
    },

    add: {
        run: (message: Message, args: Array<string>) =>
        {
            message.channel!.createMessage({ content: `${parseInt(args[0]) + parseInt(args[1])}` })
        }
    }
}

client.on("messageCreate", async (message) => 
{
    if (message.channel === undefined) return // safety measure, intent stuff
    if (message.channel.type === 1) return // don't respond on dm
    if (message.author.bot) return
    if (!message.channel.permissionsOf(message.client.user.id).has("SEND_MESSAGES")) return 

    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex   = new RegExp(`^${escaped}(?!${escaped})\\S`)

    if (!regex.test(message.content)) return

    const args = message.content.slice(prefix.length).trim().split(/ +/g) //
    const cmd  = args.shift()!.toLowerCase()

    if (!commands[cmd]) return

    commands[cmd].run(message, args)
}) 

client.connect()

process
.on("SIGTERM", () => client.disconnect(false))
.on("SIGINT", () => client.disconnect(false))
.on("uncaughtException", (err) => console.log(err))
.on("unhandledRejection", (rej) => console.log(rej))
