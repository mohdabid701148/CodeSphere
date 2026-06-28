import User from '../models/User.js';
import ConnectedAccount from '../models/ConnectedAccount.js';
import PlatformStats from '../models/PlatformStats.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

export const getProfileBySlug = async (req, res) => {
  const { slug } = req.params;

  const user = await User.findOne({ slug: slug.toLowerCase() });
  if (!user) {
    throw new ApiError(404, 'Developer profile not found');
  }

  // Privacy checking logic
  if (!user.isPublic) {
    const authHeader = req.header('Authorization');
    let isOwner = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded._id === user._id.toString()) {
          isOwner = true;
        }
      } catch (e) {
        // Token verification failed, remains false
      }
    }

    if (!isOwner) {
      throw new ApiError(403, 'This profile is private.');
    }
  }

  const connections = await ConnectedAccount.find({ userId: user._id, connected: true });
  const statsList = await PlatformStats.find({ userId: user._id });

  const githubStats = statsList.find(s => s.platform === 'github');
  const codeforcesStats = statsList.find(s => s.platform === 'codeforces');
  const leetcodeStats = statsList.find(s => s.platform === 'leetcode');
  const atcoderStats = statsList.find(s => s.platform === 'atcoder');
  const codechefStats = statsList.find(s => s.platform === 'codechef');

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          name: user.name,
          avatar: user.avatar,
          headline: user.headline,
          bio: user.bio,
          socialLinks: user.socialLinks,
          slug: user.slug,
          isPublic: user.isPublic,
          createdAt: user.createdAt
        },
        connections,
        githubStats: githubStats || null,
        codeforcesStats: codeforcesStats || null,
        leetcodeStats: leetcodeStats || null,
        atcoderStats: atcoderStats || null,
        codechefStats: codechefStats || null,
        allStats: statsList
      },
      'Public portfolio fetched successfully'
    )
  );
};

export const updateProfile = async (req, res) => {
  const { name, bio, headline, college, avatar, socialLinks, slug, onboardingCompleted } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name !== undefined && name.trim()) user.name = name.trim();
  if (headline !== undefined) user.headline = headline;
  if (bio !== undefined) user.bio = bio;
  if (college !== undefined) user.college = college;
  if (avatar !== undefined) user.avatar = avatar.trim();
  if (onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;
  if (socialLinks !== undefined) {
    user.socialLinks = {
      linkedin: socialLinks.linkedin || '',
      twitter: socialLinks.twitter || '',
      website: socialLinks.website || ''
    };
  }

  if (slug && slug.toLowerCase() !== user.slug) {
    const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (sanitizedSlug.length < 3) {
      throw new ApiError(400, 'Slug must be at least 3 alphanumeric characters.');
    }

    const existingUser = await User.findOne({ slug: sanitizedSlug });
    if (existingUser) {
      throw new ApiError(400, 'This profile URL slug is already taken.');
    }

    user.slug = sanitizedSlug;
  }

  await user.save();

  res.status(200).json(new ApiResponse(200, user, 'Profile details updated successfully.'));
};

export const togglePrivacy = async (req, res) => {
  const { isPublic } = req.body;

  if (isPublic === undefined) {
    throw new ApiError(400, 'isPublic field is required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isPublic: !!isPublic },
    { returnDocument: 'after' }
  );


  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { isPublic: user.isPublic },
      `Your profile is now ${user.isPublic ? 'publicly visible' : 'private'}.`
    )
  );
};
