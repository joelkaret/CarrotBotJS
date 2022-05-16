const Instagram = require('instagram-web-api')
const { instaUsername, instaPassword } = process.env
module.exports = (client) => {
	client.instagramLogin = async () => {
        const client = new Instagram({ instaUsername, instaPassword })
        
        client.login().then(() => {
            client
            .getProfile()
            .then(console.log)
        })
    }
}