const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const welcomeMail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'supersakshi31@gmail.com',
        subject:'Thanks for joining !',
        text:`Hello ${name}.Welcome to the app.`
    })
}

const cancelMail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'supersakshi31@gmail.com',
        subject:'Sorry to see you go.',
        text:`Hello ${name}, your account has been deleted.Could you please tell us what we could have done to keep you on board.`
    })
}

module.exports={
    welcomeMail,
    cancelMail
}