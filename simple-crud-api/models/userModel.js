import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

console.log('Initializing User model...'); // Debug log

const userSchema = new mongoose.Schema({
    userName: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: v => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v),
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8 
    }
}, {
    timestamps: true,
    autoIndex: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Explicit model creation with debug log
const User = mongoose.model('User', userSchema);
console.log('User model registered:', !!mongoose.models.User); // Should log true

export default User;