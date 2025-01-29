export const generateVerficationToken = () => {
    // generate a random verification code 
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export default generateVerficationToken;