import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DataPicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

function App() {
  const [loginPressed, setLogPressed] = useState(false);
  const [showTriggers, setShowTriggers] = useState(false);
  const [showCreateUser, setShowCreate] = useState(false);

  const [loggedUser, setLoggedUser] = useState();
  const [devices, setDevices] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [admin, setAdmin] = useState(0);

  const [name, setName] = useState('');
  const [psw, setPsw] = useState('');
  const [start, setStart] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
  const [end, setEnd] = useState(new Date());
  const [user_name, setUserName] = useState('');
  const [user_password, setUserPsw] = useState('');
  const [user_start, setUserStart] = useState(null);
  const [user_end, setUserEnd] = useState(null);
  const [user_uses, setUserUses] = useState(1);

  const ip = (process.env.NODE_ENV === 'development')?'localhost':'93.49.249.120';

  useEffect(() => {
    if (localStorage.getItem('user') !== null) {
      const user = JSON.parse(localStorage.getItem('user'));
      setLogPressed(true);
      setLoggedUser(user);
      setName(user.name);
      setAdmin(user.top_privilege);
      get_devices();
    }
  }, []);

  const login = () => {
    if(name && psw){
    fetch(`http://${ip}:8080/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: name, psw: psw })
    })
      .then(response => response.json())
      .catch(error => alert(error))
      .then(data => {
        if (data !== undefined && data !== null) {
          if(data.error === 'None'){
            setPsw('');
            setLoggedUser(data.user);
            get_devices();
            setAdmin(data.user.top_privilege);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          else{
            alert(data.error);
          }
        }
        else
          alert("An error occurred");
      });
    }
    else{
      alert('Attention! Name or password field is still blank');
    }
  }

  const logout = () => {
    setName('');
    setLoggedUser();
    setAdmin(0);
    localStorage.removeItem('user');
  }

  const get_devices = () => {
    fetch(`http://${ip}:8080/get_devices`)
      .then(response => response.json())
      .catch(error => alert(error))
      .then(data => {
        if (data) {
          setDevices(data.devices);
        }
        else
          alert('Something went wrong, try again');
      });
  }

  const trigger_device = (device) => {
    fetch(`http://${ip}:8080/trigger_device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: loggedUser.name,
        hash: loggedUser.password,
        device: device.id
      })
    })
      .then(response => response.json())
      .catch(error => alert(error))
      .then(data => {
        if (data){
          let output = '';

          if(data.status === 'ok')
            output = 'Operation status on ' + device.name + ': ' + data.status;
          else
            output = data.status;
            
          alert(output);
        }
        else
          alert('Something went wrong, try again');
      });
  }

  const history = (start, end) => {
    fetch(`http://${ip}:8080/get_triggers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: start,
        end: end,
        user: loggedUser.name,
        hash: loggedUser.password
      })
    })
      .then(response => response.json())
      .catch(error => alert(error))
      .then(data => {
        if (data) {
          setTriggers(data);
        }
        else
          alert(data.error);
      });
  }

  const add_user = () => {
    if(user_name && user_password && user_start && user_end && user_uses){
    fetch(`http://${ip}:8080/create_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user_name,
        psw: user_password,
        start: user_start,
        end: user_end,
        uses: user_uses
      })
    })
      .then(response => response.json())
      .catch(error => alert(error))
      .then(data => {
        if (data) {
          alert(data.message);
        }
        else
          alert(data.message);
      });
    }
    else{
      alert('Something missing, complete all the fields before creating a new user');
    }
  }

  const clear_user = () => {
    setUserEnd(null);
    setUserStart(null);
    setUserName('');
    setUserPsw('');
    setUserUses(1);
    setShowCreate(false);
  }

  const styles = {
    GateOpener: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#15171b',
      height: '100vh'
    },
    GOInput: {
      fontSize: 'calc(10px + 1vmin)',
      borderRadius: 15,
      textAlign: 'center',
      minHeight: '3vh',
      outline: 'none',
      margin: '1vh 1vw',
    },
    LogHeader: {
      minHeight: '100vh',
      minWidth: '75vw',
      display: (loggedUser) ? 'none' : 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'calc(10px + 4vmin)',
      color: 'white',
      backgroundColor: '#282c34',
    },
    LogButton: {
      borderRadius: 15,
      flexGrow: 1,
      outline: 'none',
      minHeight: '3vh',
      minWidth: '20vw',
      fontSize: 'calc(10px + 2vmin)',
      backgroundColor: 'white',
      margin: '1vh 1vw'
    },
    MainHeader: {
      minHeight: '100vh',
      minWidth: '75vw',
      display: (loggedUser) ? 'flex' : 'none',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'calc(10px + 2vmin)',
      color: 'white',
      backgroundColor: '#282c34'
    },
    NavBar: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      height: '20vh',
    },
    GateButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '10vh',
      width: '10vh',
      borderStyle: 'outset',
      borderRadius: '15px',
      borderWidth: '2px',
      borderColor: '-internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133))',
      cursor: 'pointer',
      margin: '1vh 2vw'
    },
    modal: {
      overlay: {
        backgroundColor: '#15171b',
      },
      content: {
        color: 'white',
        backgroundColor: '#282c34',
        display: 'flex',
        flexDirection: 'column',
        padding: '3vh 4vw',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }
  }

  return (
    <div style={styles.GateOpener}>
      <header style={styles.LogHeader}>
        <h3>Welcome to Gate Opener</h3>
        <div style={{
          display: (loginPressed) ? 'none' : 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '5vh',
          paddingLeft: '3vw',
          paddingRight: '3vw',
        }}>
          <button style={styles.LogButton} onClick={() => { setLogPressed(!loginPressed) }}>Login</button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();

          login();
        }} style={{
          display: (loginPressed) ? 'flex' : 'none',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '5vh'
          }}>
            <input style={styles.GOInput} placeholder={"Name"} value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}></input>
            <input type={'password'} style={styles.GOInput} placeholder={"Password"} value={psw}
              onChange={(e) => {
                setPsw(e.target.value);
              }}></input>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '5vh', paddingLeft: '3vw', paddingRight: '3vw'
          }}>

            <button style={styles.LogButton} >Log</button>

          </div>
        </form>

      </header>
      <header style={styles.MainHeader}>
        <Modal
          isOpen={showTriggers}
          onRequestClose={() => setShowTriggers(false)}
          style={styles.modal}
          ariaHideApp={false}
        >
          <h4 style={{ textAlign: 'center' }}>Triggers' history from {start.toISOString().split('T')[0]} to {end.toISOString().split('T')[0]}</h4>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <DataPicker
              dateFormat="yyyy/MM/dd"
              selected={start}
              onChange={data => {
                if (data < end) {
                  setStart(data);
                  history(data, end);
                }
              }}
              withPortal
              style={{ marginRight: '1vw' }}
            />
            <DataPicker
              dateFormat="yyyy/MM/dd"
              selected={end}
              onChange={data => {
                if (data > start) {
                  setEnd(data);
                  history(start, data);
                }
              }}
              withPortal
              style={{ marginLeft: '1vw' }}
            />
          </div>
          <div>
            {triggers.map(trigger => {
              return (
                <p style={{ textAlign: 'center' }} key={trigger.device + trigger.trigger_time}>{trigger.user} triggered {trigger.device} on {trigger.trigger_time}</p>
              )
            })}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '3vh', paddingLeft: '3vw', paddingRight: '3vw',
            paddingTop: '2vh'
          }}>

            <button style={styles.LogButton} onClick={() => setShowTriggers(false)}>Back</button>

          </div>
        </Modal>
        <Modal
          isOpen={showCreateUser}
          onRequestClose={() => setShowCreate(false)}
          style={styles.modal}
          ariaHideApp={false}
        >
          <input
            placeholder={'Name'}
            value={user_name}
            onChange={e => setUserName(e.target.value)}
            style={styles.GOInput}></input>
          <input
            placeholder={'Password'}
            value={user_password}
            onChange={e => setUserPsw(e.target.value)}
            style={styles.GOInput}></input>
          <input
            type={'number'}
            value={user_uses}
            onChange={e => {
              if (e.target.value > 0)
                setUserUses(e.target.value)
            }}
            style={styles.GOInput}></input>
          <DataPicker
            dateFormat="yyyy/MM/dd"
            selected={user_start}
            onChange={data => {
              if (user_end) {
                if (data < user_end)
                  setUserStart(data);
              }
              else {
                setUserStart(data);
              }
            }}
            withPortal
            style={{ marginLeft: '1vw' }}></DataPicker>
          <DataPicker
            dateFormat="yyyy/MM/dd"
            selected={user_end}
            onChange={data => {
              if (user_start) {
                if (data > user_start)
                  setUserEnd(data);
              }
              else {
                setUserEnd(data);
              }
            }}
            withPortal
            style={{ marginLeft: '1vw' }}></DataPicker>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'row' }}>
            <button style={styles.LogButton} onClick={() => {
              clear_user();
            }}>
              Back
            </button>
            <button style={styles.LogButton} onClick={() => {
              add_user()
              clear_user();
            }}>
              Create user
            </button>
          </div>

        </Modal>
        <div style={styles.NavBar}>
          <h4>Hi {name}</h4>
          <button style={{
            borderRadius: '15px',
            minWidth: '4vw',
            outline: 'none',
            minHeight: '3vh',
            fontSize: 'calc(10px + 2vmin)',
            backgroundColor: 'white',
          }} onClick={() => { logout() }}>Log out</button>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}>
          {devices.map((device) => {
            return (
              <div
                style={styles.GateButton}
                onClick={() => { trigger_device(device) }}
                key={device.id}>
                <h4>{device.name}</h4>
              </div>
            )
          })
          }
        </div>
        <div style={{
          display: (admin === 1) ? 'flex' : 'none', flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
          height: '20vh'
        }}>
          <button
            style={{
              borderRadius: '15px',
              minWidth: '4vw',
              outline: 'none',
              minHeight: '3vh',
              fontSize: 'calc(10px + 2vmin)',
              backgroundColor: 'white',
            }}
            onClick={() => {
              setShowTriggers(true);
              history(start, end);
            }}>
            View history
            </button>
          <button
            style={{
              borderRadius: '15px',
              minWidth: '4vw',
              outline: 'none',
              minHeight: '3vh',
              fontSize: 'calc(10px + 2vmin)',
              backgroundColor: 'white',
            }}
            onClick={() => {
              setShowCreate(true);
            }}>
            Add user
            </button>
        </div>
      </header>
    </div>
  );
}

export default App;
