import mongoose  from 'mongoose';

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // likes: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Like"
    // }],
    // comments: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Comment"
    // }]
},{timestamps: true});

export const Tweet = mongoose.model("Tweet", tweetSchema);