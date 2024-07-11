import React, { useState, useEffect, useContext, ReactElement } from 'react';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { UserContext } from '../UserContext';

import io from 'socket.io-client';
import axios from 'axios';
import { User, Conversations } from '@prisma/client';
import { ConversationWithParticipants } from '../../../../types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const socket = io('https://mkdev.dev');

const Messages = (): ReactElement => {

  const userId = useContext(UserContext).id;
  const [con, setCon] = useState<ConversationWithParticipants | null>();
  const [addingConversation, setAddingConversation] = useState<boolean>(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [participantsLabel, setParticipantsLabel] = useState<string>('')
  const [participantsEntry, setParticipantsEntry] = useState<(string)[]>([]);
  const [allConversations, setAllConversations] = useState<ConversationWithParticipants[]>([]);
  const [visibleConversation, setVisibleConversation] = useState<ConversationWithParticipants | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loginError, setLoginError] = useState<boolean>(false);

  // get all current conversations for current user
  const getAllConversations = (): void => {
    axios
      .get('/api/conversations')
      .then(({ data }) => {
        setAllConversations(data);
      })
      .catch((err) => {
        setLoginError(true);
        console.error('Failed to retrieve conversations:\n', err);
      })
  }

  // get list of conversations upon page load
  useEffect(() => {
    getAllConversations();
  }, [])

  // get list of users for autocomplete
  const getAllUsers = (): void => {
    axios
      .get('/api/users')
      .then((users) => {
        setAllUsers(users.data);
      })
      .catch((err) => {
        console.error('Failed to get list of users:\n', err);
      })
  }

  // get list of available users upon load
  useEffect(() => {
    getAllUsers();
  }, [])

  const beginConversation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e.preventDefault();

    setAddingConversation(true);
  }

  const changeParticipants = (e: any, value: (string)[] ): void => {
    setParticipantsEntry(value);
    // iterate through participants entry and find user objects from all users
    const participantsArr: User[] = [];
    value.forEach((username) => {
      for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].username === username) {
          participantsArr.push(allUsers[i]);
        }
      }
    })
    setParticipants(participantsArr);
  }

  const generateConversationLabel = (con: Conversations): void => {
    axios
      .get(`/api/conversations/label/${con.id}`)
      .then(({ data }) => {
        let label = '';
        for (let i = 0; i < data.participants.length; i++) {
          if (data.participants[i].id !== userId) {
            label += `${data.participants[i].username}, `
          }
        }
        setParticipantsLabel(label.slice(0, label.length - 2))
      })
      .catch((err) => {
        console.error('Failed to generate conversation label', err);
      })
  }

  const addConversation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e.preventDefault();

    // TODO: check if participants has length 0 -> if length 0, prompt user to add usernames. can't create conv without participants
    if (!participants.length) {
      // use mui textfield error -> update a state variable responsible for showing error
      return;
    }

    // create conversation, set new conversation id
    axios
      .post('/api/conversations', {
        participants: participants, // users that sender enters
      })
      .then(({ data }) => {
        generateConversationLabel(data);
        return data;
      })
      .then((data) => {
        setCon(data);
        return data;
      })
      .then((data) => {
        socket.emit('add-conversation', {
          id: data.id
        });
        setAddingConversation(false);
        getAllConversations();
        setParticipantsEntry([]);
      })
      .catch((err) => {
        console.error('Failed to create a conversation:\n', err);
      });
  }

  const selectConversation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, newCon: ConversationWithParticipants | null): void => {
    if (addingConversation) {
      setAddingConversation(false);
    }
    setCon(newCon);
    if (newCon) {
      // set label at top of conversation
      generateConversationLabel(newCon);
    }
    setVisibleConversation(newCon);
  }

  const deleteConversation = () => {
    setCon(null);
    getAllConversations();
  }

  // add emitted conversation to allConversations
  socket.on('add-conversation', (conversation: ConversationWithParticipants): void => {
    setAllConversations([...allConversations, conversation]);
    getAllConversations();
  })

  socket.on("connect_error", (err) => {
    // the reason of the error, for example "xhr poll error"
    console.log('io client err, Messages', err.message);
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: 2
        }}
      >
        <Typography variant="h3">
          Inbox
        </Typography>
      </Box>
      { loginError ? (
        <Box
          sx={{
            display: 'flex',
            padding: 2
          }}
        >
          <Typography variant="h3">
            You must be logged in to view conversations
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              pl: 2,
              pb: 2
            }}
          >
            <Button
              variant='contained'
              onClick={ beginConversation }
            >
              ➕ New Conversation
            </Button>
          </Box>
          <Box                                     // top most container for ConversationList and ConversationView
            className='glass-card'
            sx={{
              display: 'flex',
              minHeight: '70vh',
              mx: 2
            }}
          >
            <Box                              // ConversationList container
              sx={{
                pl: 4,
                borderRight: 2,
                borderColor: 'rgba(255, 255, 255, 0.125)',
              }}
            >
              <ConversationList
                allCons={ allConversations }
                visibleCon={ visibleConversation }
                setCons={ getAllConversations }
                select={ selectConversation }
                deleteCon={ deleteConversation }
              />
            </Box>
            <Box                              // ConversationView container
              sx={{
                p: 2,
                flexGrow: 1,
              }}
            >
              { addingConversation ? (
                  <form>
                    <Autocomplete
                      multiple
                      id="tags-filled"
                      options={allUsers.map((option) => option.username)}
                      value={ participantsEntry! }
                      onChange={ changeParticipants }
                      freeSolo
                      renderTags={(value, getTagProps) =>
                        value.map((option, index: number) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip variant="outlined" label={option} key={key} {...tagProps} />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          label="To:"
                          placeholder="usernames"
                        />
                      )}
                    />
                    <Button onClick={ addConversation } variant='contained'>Create</Button>
                  </form>
                ) : ('')
              }
              { con ? (
                <ConversationView
                  con={ con }
                  visibleCon={ visibleConversation }
                  addingConversation={ addingConversation }
                  label={ participantsLabel }
                />
                ) : ('')
              }
            </Box>
          </Box>
        </Box>
      )
      }
    </Box>
  );
}

export default Messages;
