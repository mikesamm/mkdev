import React, { useState, useEffect, ReactElement } from 'react';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';

import io from 'socket.io-client';
import axios from 'axios';
import { User, Conversations } from '@prisma/client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const socket = io('http://localhost:4000');

const Messages = (): ReactElement => {

  const [con, setCon] = useState<Conversations | null>();
  const [addingConversation, setAddingConversation] = useState<boolean>(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [participantsLabel, setParticipantsLabel] = useState<string>('')
  const [participantsEntry, setParticipantsEntry] = useState<(string | null)[]>([]);
  const [allConversations, setAllConversations] = useState<Conversations[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loginError, setLoginError] = useState<boolean>(false);

  // get all current conversations for current user
  const getAllConversations = (): void => {
    axios
      .get('/api/conversations')
      .then((conversations) => {
        setAllConversations(conversations.data);
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

  const changeParticipants = (e: any, value: (string | null)[] ): void => {
    setParticipantsEntry(value);
    // iterate through participants entry and find user objects from all users
    const participantsArr: User[] = [];

    // store in array to then pass in request body
    value.forEach((username) => {
      for (let i = 0; i < allUsers.length; i++) {
        if ( allUsers[i].username === username) {
          participantsArr.push(allUsers[i]);
        }
      }
    })
    setParticipants(participantsArr);

    // set participants label
    const label = participantsArr.reduce((acc, curr) => {
        return acc.concat(`${curr.username}, `)
    }, '');
    setParticipantsLabel(label.slice(0, label.length - 2));
  }

  const addConversation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e.preventDefault();

    // TODO: check if participants has length 0 -> if length 0, prompt user to add usernames. can't create conv without participants
    // use mui textfield error
    if (!participants.length) {
      return;
    }

    // create conversation, set new conversation id
    axios
      .post('/api/conversations', {
        participants: participants, // users that sender enters
        label: participantsLabel
      })
      .then((conversation) => {
        setCon(conversation.data);

        socket.emit('add-conversation', {
          id: conversation.data.id
        });
      })
      .then(() => {
        setAddingConversation(false);
        getAllConversations();
        setParticipantsEntry([]);
      })
      .catch((err) => {
        console.error('Failed to create a conversation:\n', err);
      });
  }

  const selectConversation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, newCon: Conversations | null): void => {
    if (addingConversation) {
      setAddingConversation(false);
    }
    setCon(newCon);
    if (newCon) {
      setParticipantsLabel(newCon!.label);
    }
  }

  const deleteConversation = () => {
    setCon(null);
    getAllConversations();
  }

  // add emitted conversation to allConversations
  socket.on('add-conversation', (conversation: Conversations): void => {
    setAllConversations([...allConversations, conversation]);
    getAllConversations();
  })

  return (
    <div>
      <h1>Direct Messages</h1>
      { loginError ? (
        <>
          <h3> You must be logged in to view conversations</h3>
        </>
      ) : (
        <>
          <Button onClick={ beginConversation }>➕ Start Conversation</Button>
          <ConversationList 
            allCons={ allConversations } 
            setCons={ getAllConversations } 
            select={ selectConversation }
            deleteCon={ deleteConversation }
          />
          { addingConversation ? (
              <form>
                <Autocomplete
                  multiple
                  id="tags-filled"
                  options={allUsers.map((option) => option.username)}
                  value={ participantsEntry }
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
                <button onClick={ addConversation }>Add Conversation</button>
              </form>
            ) : ('')
          }
          { con ?
            <ConversationView
              addingConversation={ addingConversation }
              con={ con }
              label={ participantsLabel }
            /> : ''
          }
        </>
      )
      }
    </div>
  );
}

export default Messages;
