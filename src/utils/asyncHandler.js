const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) =>next(err));
    }
}

export { asyncHandler };


// ------------method 1-- wrapper function----------------
// const asyncHandler = (fn) =>async (req, res, next) => {
//     try{
//         await fn(req, res, next);

//     }catch(err){
//         res.status(err.status || 500).json({
//             success: false,
//             message: err.message
//         });
//         next(err);
//     }
// }



// node js api error class