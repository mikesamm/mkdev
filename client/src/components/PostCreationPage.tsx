import React, { ReactElement, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MarkDown from './MarkDown';
import Repo from './post creation/Repo';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';

const PostCreationPage = (): ReactElement => {
  const navigate = useNavigate();
  const [title, setTitle]: [string, Function] = useState('# ');
  const [body, setBody]: [string, Function] = useState('');
  const [titleFieldTooltip, setTitleFieldTooltip] = useState(false);
  const [bodyFieldTooltip, setBodyFieldTooltip] = useState(false);
  // const [img, setImg]: [any, Function] = useState();
  const [cantSubmit, setCantSubmit]: [boolean, Function] = useState(false);
  const [repo, setRepo]: [{link: string, files: { path: string; contents: string }[]},Function] = useState({link:'', files:[]});
  const [currentTab, setCurrentTab] = useState('0');
  const [allPostTags, setAllPostTags] = useState([]);
  const allPostTagsREF = useRef(allPostTags);

  useEffect(() => {
    axios.get('/api/tags/all/post')
      .then(({data}) => {
        setAllPostTags(data);
      })
  }, [allPostTagsREF])

  const handleTabChange = (e: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }

  const handleTextInput = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    switch (e.target.name) {
      case 'title': {setTitle(`# ${e.target.value}`); break;}
      case 'body': {setBody(e.target.value); break;}
    }
  };

  // const handleFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
  //   console.log(e.target.files);
  //   setImg(e.target.files![0]);
  // };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setCantSubmit(true);
    axios.postForm('/api/posts', { title, body, /*img,*/ repo:btoa(JSON.stringify(repo)) })
      .then(({ data }) => {
        navigate('/dashboard');
    })
    .catch((err) => {
      setCantSubmit(false);
    });
  };

  const saveFile = (path: string, contents: string) => {
    setRepo({...repo, files: [...repo.files, {path, contents}]})
  };

  const saveRepo = (link: string) => {
    setRepo({...repo, link})
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs />
      <Grid item xs={8}>
        <Paper elevation={3}>
          <Box sx={{ display:'flex', flexDirection: 'row', alignItems:'center'}}>
            <Typography variant='h1'>Create Post</Typography>
          </Box>
          <Divider orientation='horizontal' variant='middle'/>

          <TabContext value={currentTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange}>
                <Tab label="Edit" value="0"/>
                <Tab label="Preview" value="1"/>
                <Tab label="Repo" value="2"/>
              </TabList>
            </Box>
            <TabPanel value="0">
              <Paper>
                <Stack sx={{marginRight: 2, marginLeft: 2}}>
                  <Input
                    id="post-title"
                    type="text"
                    value={title.slice(2)}
                    onChange={handleTextInput}
                    name="title"
                    placeholder="Title"
                    />
                  <Input
                    id="post-body"
                    type="text"
                    multiline
                    value={body}
                    onChange={handleTextInput}
                    name="body"
                    placeholder="Body Text"
                    rows={30}
                    />
                </Stack>
              </Paper>
            </TabPanel>
            <TabPanel value="1">
              <Paper>
                <Stack>
                  <MarkDown text={title} />
                  <Divider orientation='horizontal' variant='middle' />
                  <MarkDown text={body} />
                </Stack>
              </Paper>
            </TabPanel>
            <TabPanel value="2">
              <Paper>
                <Repo saveFile={saveFile} saveRepo={saveRepo}/>
              </Paper>
            </TabPanel>
          </TabContext>
        </Paper>
      </Grid>
      <Grid item xs />
    </Grid>
  );
};

export default PostCreationPage;
