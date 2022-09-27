const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type:String,
        trim:true,
        unique: 1
    },
    password: {
        type:String,
        minlength: 5
    },
    lastname: {
        type:String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function( next ){  // 유저 모델의 정보를 저장하기 전에 function을 실행하고 다 끝나면 index.js에 있는 user.save실행
    var user = this;

    if(user.isModified('password')){ // 비밀번호를 바꿀때만 암호화
    // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) { // user.password는 내가 직접 친 비번(암호화 되지않은 비밀번호)
                if(err) return next(err)
                user.password = hash // 암호화된 비밀번호를 넣어줌
                next()
            })
        })
    } else { // 비밀번호가 아니라 다른거를 바꿀때는
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {

    // plainPassword 1234567 암호화된 비번 $2b$10$Y25e5YvHyiWYE9Ja9qGvw.aI7rJk1Og8IuKFb6/9zM5lXQ25/pAQG 두개를 체크
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        // 비번이 다르다면
        if(err) return cb(err);
        // 비번이 같다면
        cb(null, isMatch)
    })

}
userSchema.methods.generateToken = function(cb) {

    var user = this;
    // jsonwebtoken 을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    // user._id + 'secretToken' = token
    // -> 
    // 'secretToken' -> iser._id

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;

    // user._id + '' = token
    // 토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function(err, user) {
            if(err) return cb(err)
            cb(null, user)
        })
    })
}
const User = mongoose.model('User', userSchema)

module.exports = {User } // 이 스키마를 다른데에서도 쓸 수 있게 export 해줌