import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function generateAccessToken(id : number,email : string) {
    return jwt.sign(
        { id : id , email : email},
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn : "15m"}
    );
}

function generateRefreshToken(id : number,email : string){
    return jwt.sign(
        {id : id, email : email},
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn : "7d"}
    )
}