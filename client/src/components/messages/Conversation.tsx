import React, { useState, useEffect, useContext, ReactElement } from 'react';
import { UserContext } from '../UserContext';
import axios from 'axios';
import ConversationDelConf from './ConversationDelConf';
import io from 'socket.io-client';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import Badge from '@mui/material/Badge';

import { Conversations } from '@prisma/client';
import { Typography } from '@mui/material';

const socket = io('http://localhost:4000');

interface PropsType {
  con: Conversations;
  visibleCon: Conversations | null,
  select: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, newCon: Conversations | null) => void;
  setCons: () => void;
  deleteCon: () => void;
}

const Conversation: React.FC<PropsType> = (props): ReactElement => {
  const {
    con,
    visibleCon,
    select,
    setCons,
    deleteCon } = props;

  const userId = useContext(UserContext);
  const [unreadMsgs, setUnreadMsgs] = useState<React.ReactNode>(0);
  const [isHidden, setIsHidden] = useState<boolean | undefined>(false) // badge in view
  const [showDelConfirm, setShowDelConfirm] = useState<boolean>(false);

  // get number of unread messages in conversation
  useEffect(() => {
    axios
      .get(`/api/messages/unread/${con.id}/${userId}`)
      .then(({ data }): void => {
        setUnreadMsgs(data);
      })
  }, [unreadMsgs, userId])

  socket.on('message', (message) => {

    /**
     * message = {
     *  ...data, // from prisma db operation
     * newMessage: 1,
     *  conversation: con.id
     * }
     *
     * when a new message event happens, a new message should be added ONLY if
     *    conversation from socket is not visible AND conversation from socket does not match
     *    conversation id of this current conversation
     */

    console.log('message.conversationId', message.conversationId);
    if (visibleCon !== null) {
      console.log('visibleConversation', visibleCon.id);
      if (visibleCon.id !== message.conversationId) {
        setIsHidden(false);
        setUnreadMsgs(() => unreadMsgs + message.newMessage);
      } else if (visibleCon.id === con.id) {
        setIsHidden(true);
      }
    } else {
      setIsHidden(false);
      setUnreadMsgs(() => unreadMsgs + message.newMessage);
    }
  })

  // pass selected conversation id to Messages component, set selected conversation as visible
  const selectConversation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, newCon: Conversations): void => {
    select(e, newCon);

    // disconnect newly read msgs from user
    axios
      .patch(`/api/users/read/${userId}/${con.id}`)
      .then(() => {
        setUnreadMsgs(0)
        // send socket event to change inbox notification badge
        socket.emit('read-message', {})
      })
      .catch((err) => {
        console.error('Failed to mark messages read:\n', err);
      })

  }

  // show delete conversation confirmation dialog
  const handleDelete = () => {
    setShowDelConfirm(true);
  }

  // close delete conversation confirmation dialog
  const handleClose = () => {
    setShowDelConfirm(false);
  }

  return (
    <Grid item>
      <Badge badgeContent={ unreadMsgs } invisible={ isHidden }color="warning">
        <ButtonGroup
          sx={{
            width: '200px'
          }}
          variant='contained'
        >
          <Button
            fullWidth
            onClick={ (e)=> {selectConversation(e, con)} }
          >
            <Typography
              noWrap
              align='left'
            >
              { con.label }
            </Typography>
          </Button>
          <Button onClick={ handleDelete }>
            <DeleteIcon />
          </Button>
        </ButtonGroup>
      </Badge>
      <ConversationDelConf con={ con } setCons={ setCons } deleteCon={ deleteCon } handleClose={ handleClose } hidden={ showDelConfirm }/>
    </Grid>
  );
}

export default Conversation;
