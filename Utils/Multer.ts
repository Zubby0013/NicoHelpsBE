import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = file.fieldname + "-" + uniqueSuffix + ".jpg";
        console.log("Saving file as:", fileName);
        cb(null, fileName);
    },
});

export const uploadImage = multer({
    storage: storage,

    fileFilter: async function (req: any, file: any, callback: any) {
        var ext: any = file.mimetype;

        if (
            ext !== "image/jpeg" &&
            ext !== "image/jpg" &&
            ext !== "image/gif" &&
            ext !== "image/png"
        ) {
            return callback(new Error("Only images are allowed"));
        }
        callback(null, true);
    },

    limits: { fileSize: 1048576 },
}).single("file");
