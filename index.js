const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const { User } = require("./models/User");

// application/x-www-form-urlencoded 타입으로 된것을 분석해서 가져오는 것
app.use(bodyParser.urlencoded({ extended: true}));

// application/json 타입으로 된것을 분석해서 가져오는 것
app.use(bodyParser.json());

// mongodb 연결
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://mjpark401:yzzznim9941@minji-park.5mrrrtg.mongodb.net/?retryWrites=true&w=majority', {
    
}).then(()=> console.log('MongoDB Connected...'))
.catch(err => console.log('err'))


app.get('/', (req, res) => res.send('Hello World! Minji'))

app.post('/register', (req, res) =>  { // post이기 때문에 postman에서도 post선택
    // 회원 가입 할때 필요한 정보들을 client에서 가져오면 
    // 그것들을 데이터 베이스에 넣어준다.
    
    const user = new User(req.body)

    // 정보들이 user모델에 저장이 된 것
    user.save((err, userInfo) => { 
        // 에러가 있다면 성공하지 못했다고 제이슨 형식으로 전달한다
        if(err) 
        return res.json({ success:false, err})
        console.log(userInfo)
        return res.status(200).json({ // status(200)은 성공했다라는 표시 => json형식으로 전달
            success: true
        })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
