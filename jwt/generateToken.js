import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
    const accessToken = jwt.sign({
        id: user.id,
    },
        process.env.SECRET_KEY,
        { expiresIn: '1d', }
    );

    return accessToken;
};