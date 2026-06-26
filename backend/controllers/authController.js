import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Helper function to generate and save access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User does not exist');
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message || 'Something went wrong while generating tokens');
  }
};

export const initiateLogin = async (req, res) => {
  const { mock } = req.query;

  if (mock === 'true' || process.env.MOCK_AUTH === 'true') {
    let user = await User.findOne({ email: 'mock.dev@codesphere.local' });
    if (!user) {
      user = await User.create({
        googleId: 'mock-google-id-12345',
        name: 'Mock Developer',
        email: 'mock.dev@codesphere.local',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mockdev',
        role: 'user',
        slug: 'mockdev',
        bio: 'A passionate developer showcasing profile statistics.',
        headline: 'Full Stack Engineer & Competitive Programmer',
        isPublic: true,
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const userPayload = encodeURIComponent(
      JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        slug: user.slug,
      })
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/login?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userPayload}`
    );
  }

  try {
    if (process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
      throw new Error('Google OAuth credentials are not configured. Please use Mock User login.');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=openid%20profile%20email`;

    res.redirect(googleAuthUrl);
  } catch (error) {
    console.error('OAuth Initiate Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message || 'OAuth initiation failed')}`);
  }
};

export const googleCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    throw new ApiError(400, 'Authorization code is missing');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new ApiError(400, `Token Exchange Error: ${tokenData.error_description || tokenData.error}`);
    }

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    if (userInfo.error) {
      throw new ApiError(400, `Google UserInfo Error: ${userInfo.error_description || userInfo.error}`);
    }

    const { sub: googleId, name, email, picture: avatar } = userInfo;

    let user = await User.findOne({ email });

    if (user) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar;
      await user.save();
    } else {
      const baseSlug = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const initialSlug = `${baseSlug}-${randomSuffix}`;
      const defaultName = baseSlug || 'Developer';
      user = await User.create({
        googleId,
        name: name || defaultName,
        email,
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${defaultName}`,
        slug: initialSlug,
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const userPayload = encodeURIComponent(
      JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        slug: user.slug,
      })
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/login?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userPayload}`
    );
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Use a generic error message to prevent leaking sensitive backend error details
    const safeErrorMessage = 'Authentication failed. Please try again or use another login method.';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(safeErrorMessage)}`);
  }
};

// POST /auth/refresh-token - Refresh expired access token
export const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is missing');
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token - User does not exist');
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, 'Refresh token is invalid or has expired');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
};

export const getMe = async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'User profile fetched successfully'));
};

export const logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Clear refresh token in database to prevent hijacking session
    await User.findOneAndUpdate(
      { refreshToken },
      {
        $unset: {
          refreshToken: 1,
        },
      }
    );
  }

  res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'));
};
