import express from "express"
import { AuthController } from "../controller/auth.controller";
import { LoginDTO } from "../dtos/loginDto";
import { validateDto } from "../middleware/validateDto";
import { SignUpDTO } from "../dtos/signUpDto";
import { ResetPwdDTO } from "../dtos/resetPwd";
import { authChecker } from "../middleware/authChecker";
const router = express.Router();
const authController = new AuthController();

router.post("/login",validateDto(LoginDTO) ,authController.login.bind(authController));
router.post("/signup",validateDto(SignUpDTO),authController.signUp.bind(authController));
export default router;