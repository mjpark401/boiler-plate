const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

// application/x-www-form-urlencoded 타입으로 된것을 분석해서 가져오는 것
app.use(bodyParser.urlencoded({ extended: true}));

// application/json 타입으로 된것을 분석해서 가져오는 것
app.use(bodyParser.json());
app.use(cookieParser());
// mongodb 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    
}).then(()=> console.log('MongoDB Connected...'))
.catch(err => console.log('err'))


app.get('/', (req, res) => res.send('Hello World! Minji~~~~'))

app.post('/api/users/register', (req, res) =>  { // post이기 때문에 postman에서도 post선택
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

app.post('/api/users/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => { // 유저 컬렉션 안에 이 이메일을 가진 유저가 한명도 없다면
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다. "
            })
        }   

    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인.

        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
            return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})
            // 비밀번호 까지 맞다면 토큰을 생성하기.
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err); //status(400)은 실패했다는 뜻
                // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
                res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user._id})
                })
            })
        })
    })
// role 1 어드민 role 2 특정부서 어드민
// role 0 일반유저 role 0이 아니면 관리자
app.get('/api/users/auth', auth , (req, res) => {
    // 여기까지 미들웨어를 통과해 왔단 얘기는 authentication이 true 라는 말.
    res.status(200).json({
        _id: req.user._id, 
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name:req.user.name,
        lastname:req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

// 로그아웃 라우터
app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id},
        {token: ""}
        , (err, user) => {
            if(err) return res.json({success: false, err});
            return res.status(200).send({
                success: true
            })
        })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
