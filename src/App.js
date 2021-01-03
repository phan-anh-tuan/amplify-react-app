import Amplify, { API, DataStore, Predicates } from 'aws-amplify';
import awsconfig from './aws-exports';
import React, { useState, useEffect }  from 'react';

import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { Post, PostStatus } from './models'

Amplify.configure(awsconfig);

const apiName = 'amplifyappApi'; // replace this with your api name.
const path = '/items'; //replace this with the path you have configured on your API

async function testing_persist_data() {
  try {
    await DataStore.save(
      new Post({
        title: "My First Post",
        status: PostStatus.DRAFT
      })
    );
  } catch (error) {
    throw error;
  }
}

async function testing_query_data() {
  try {
    const posts = await DataStore.query(Post);
    return posts;
  } catch (error) {
    throw error;
  }
}

async function testing_delete_data() {
  try {
    // await DataStore.delete(Post, post => post.status("eq", PostStatus.DRAFT));
    await DataStore.delete(Post, Predicates.ALL);
    return true;
  } catch (error) {
    throw error;
  }
}


function App() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState("none");
    const [notes, setNotes] = useState([]);
    
    testing_persist_data()
      .then(() => console.log("Post saved successfully!"))
      .catch((error) =>  console.log("Error saving post", error))

    testing_query_data()
      .then((posts) => console.log("Posts retrieved successfully!", JSON.stringify(posts, null, 2)))
      .catch((error) =>  console.log("Error retrieving posts", error))

    testing_delete_data()
      .then(() => console.log("Posts deleted successfully!"))
      .catch((error) =>  console.log("Error deleting post", error))

    useEffect(() => { 
      setIsLoading("block");
      API
        .get(apiName, path + '/' + Date.now(), {})
        .then(response => {
          setIsLoading("none");
          // console.log(JSON.stringify(response));
          setNotes(response)
        })
        .catch(error => {
          console.log(error.response);
          setIsLoading("none");
        });
    },[]);

    const deleteData = (id) => {
      setIsLoading("block");
      API
        .del(apiName, path + '/object/' + id, {})
        .then(response => {
          setNotes(notes.filter(note => note.creationDate !== id));
          setIsLoading("none");
        })
        .catch(error => {
          console.log(error.response);
          setIsLoading("none");
        });
    }

    const submitData = () => {
      setIsLoading("block");
      let myInit = {
        body: {
            "creationDate": Date.now(),
            name,
            description
        }, // replace this with attributes you need
        headers: {}, // OPTIONAL
      };
    
      API
        .post(apiName, path, myInit)
        .then(response => {
          setName("");
          setDescription("");
          setNotes([...notes, myInit.body])
          setIsLoading("none");
        })
        .catch(error => {
          console.log(error.response);
          setIsLoading("none");
        });
    };
    return (
      <div className="App">
        <h1>API client</h1>
        <div style={ isLoading === 'none' ? { display: 'none' } : {display: 'block'}}>submitting....</div>
        <input
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          value={name}
        />
        <input
          onChange={e => setDescription( e.target.value)}
          placeholder="Description"
          value={description}
        />
        <button 
          onClick={submitData}
        >Create Note</button>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
           <tbody>
          {
            notes.map(note => (
              <tr key={note.creationDate}>
                <td>{note.creationDate}</td>
                <td>{note.name}</td>
                <td>{note.description}</td>
                <button onClick={() => deleteData(note.creationDate)}>Delete</button>
              </tr>
              ))
          }
          </tbody>
        </table>
        
        {/* <AmplifySignOut /> */}
      </div>
    );
}

export default withAuthenticator(App);