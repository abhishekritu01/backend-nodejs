import mongoose,{Schema} from 'mongoose';
import mongooseAggregratePaginate from 'mongoose-aggregate-paginate-v2'

const commentSchema = new Schema({

    content: {
        type: String,
        required: true,
        trim: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
},{timestamps: true});

commentSchema.plugin(mongooseAggregratePaginate);

export const Comment = mongoose.model("Comment", commentSchema);