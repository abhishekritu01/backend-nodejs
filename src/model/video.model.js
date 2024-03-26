import mongoose,{Schema} from 'mongoose';
import mongooseAggregratePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema({
    videoFile: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    views: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
},{timestamps: true});



videoSchema.plugin(mongooseAggregratePaginate);

export const Video = mongoose.model("Video", videoSchema);