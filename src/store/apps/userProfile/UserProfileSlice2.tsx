import axios from '../../../utils/axios';
import { createSlice } from '@reduxjs/toolkit';
import { map } from 'lodash';
import { AppDispatch } from '../../store';

const API_URL = '/api/data/postData2';

interface StateType {
  posts: any[];
  followers: any[];
  gallery: any[];
}

const initialState = {
  posts: [],
  followers: [],
  gallery: [],
};

export const UserProfileSlice2 = createSlice({
  name: 'UserPost2',
  initialState,
  reducers: {
    getPosts: (state, action) => {
      state.posts = action.payload;
    },
    getFollowers: (state, action) => {
      state.followers = action.payload;
    },
    getPhotos: (state, action) => {
      state.gallery = action.payload;
    },
    onToggleFollow(state: StateType, action) {
      const followerId = action.payload;

      const handleToggle = map(state.followers, (follower) => {
        if (follower.id === followerId) {
          return {
            ...follower,
            isFollowed: !follower.isFollowed,
          };
        }

        return follower;
      });

      state.followers = handleToggle;
    },
  },
});

export const { getPosts, getFollowers, onToggleFollow, getPhotos } = UserProfileSlice2.actions;

export const fetchPosts = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get(`${API_URL}`);
    dispatch(getPosts(response.data));
  } catch (err: any) {
    throw new Error(err);
  }
};
export const likePosts = (postId: number) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.post('/api/data/posts2/like', { postId });
    dispatch(getPosts(response.data.posts));
  } catch (err: any) {
    throw new Error(err);
  }
};
export const addComment = (postId: number, comment: any[]) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.post('/api/data/posts2/comments/add', { postId, comment });
    dispatch(getPosts(response.data.posts));
  } catch (err: any) {
    throw new Error(err);
  }
};

export const addReply =
  (postId: number, commentId: any[], reply: any[]) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post('/api/data/posts2/replies/add', {
        postId,
        commentId,
        reply,
      });
      dispatch(getPosts(response.data.posts));
    } catch (err: any) {
      throw new Error(err);
    }
  };

export const fetchFollwores = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get(`/api/data/users`);
    dispatch(getFollowers(response.data));
  } catch (err: any) {
    throw new Error(err);
  }
};

export const fetchPhotos = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get(`/api/data/gallery`);
    dispatch(getPhotos(response.data));
  } catch (err: any) {
    throw new Error(err);
  }
};

export default UserProfileSlice2.reducer;
