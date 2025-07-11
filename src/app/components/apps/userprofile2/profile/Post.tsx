import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useEffect } from "react";
import { useSelector, useDispatch } from "@/store/hooks";
import { fetchPosts } from "@/store/apps/userProfile/UserProfileSlice2";
import PostItem from "./PostItem";
import { PostTextBox } from "./PostTextBox";
import { PostType } from "../../../../(DashboardLayout)/types/apps/userProfile";
import { TaskCard } from "./TaskCard";
import BlankCard from "../../../shared/BlankCard";

const Post = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const getPosts: PostType[] = useSelector(
    (state) => state.userpostsReducer2.posts
  );

  return (
    <Grid container spacing={3}>
      <Grid item sm={12}>
        <TaskCard />
      </Grid>
      <Grid item sm={12}>
        <BlankCard>
          <Box p={3}>
            <PostTextBox />
            {getPosts.map((posts) => {
              return (
                <Grid item sm={12} key={posts.id}>
                  <PostItem post={posts} />
                </Grid>
              );
            })}
          </Box>
        </BlankCard>
      </Grid>
    </Grid>
  );
};

export default Post;
