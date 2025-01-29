import { mailtrapClient, sender } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js";


export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email address",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "email verification",
        });
        console.log("Verification email sent successfully!");
    } catch (error) {
        console.log("Error in sendVerificationEmail: ", error.message)
    }
};

export const sendWelcomeEmail = async (email, username) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "5c23dd11-ead5-4137-bf7c-f1ecf1cb0945",
            template_variables: {
                "company_info_name": "SSC",
                "name": `${username}`,
            }
        });
        console.log("Welcome email sent successfully!");
    } catch (error) {
        console.log("Error in sendWelcomeEmail: ", error.message)
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Email!",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset",
        });
        console.log("Reset email sent successfully!");
    } catch (error) {
        console.log("Error in sendPasswordResetEmail: ", error.message)
    }
};

export const sendResetSuccessfulEmail = async (email) => {
  const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful!",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset success",
        });
        console.log("Reset successful email sent successfully!");
    } catch (error) {
        console.log("Error in sendResetSuccessfulEmail: ", error.message)
    }
};