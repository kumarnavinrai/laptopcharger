// Import required electron modules
const electronApp = require('electron').app;
const { Menu, Tray } = require('electron')
const electronBrowserWindow = require('electron').BrowserWindow;
const { ipcMain } = require('electron');
const batteryLevel = require('battery-level')
const isCharging = require('is-charging')
const fs = require('fs');
const path = require('path')
let tray = null

// Import required Node modules
const nodePath = require('path');

// Prevent garbage collection
let window;

// Settings object
let settings = {
    'renderer': {
        'key1': 'navin',
        'key2': 'kumar'
    }
}

let levelOfBattery = 0;
let chargingYesOrNO = false;
let col = 0;
let pol = 0;
let charging = 0;

function createTray() {
    tray = new Tray(path.join(__dirname, 'assets/iconfforbtteryapp.png'))
  
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open', click: () => window.show() },
      { label: 'Quit', click: () => electronApp.quit() }
    ])
  
    tray.setToolTip('Laptop Charging')
    tray.setContextMenu(contextMenu)
  
    tray.on('click', () => window.show())
  }

function createWindow() {
    const window = new electronBrowserWindow({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        show: false,
        icon: path.join(__dirname, 'assets/iconfforbtteryapp.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: nodePath.join(__dirname, 'preload.js')
        },
        skipTaskbar: true,
        show: false
    });
    Menu.setApplicationMenu(null)

        window.loadFile('index.html')
        .then(() => {
            const userDataPath = electronApp.getPath('userData');
            const filePath = path.join(userDataPath, 'myData.json');
            var dataToSend = {};
            setInterval(() => {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const myData = data?JSON.parse(data):null;
                    dataToSend = myData;
                });

            
                window.webContents.send('sendSettings',
                    {
                        levelOfBattery: levelOfBattery,
                        chargingYesOrNO: chargingYesOrNO,
                        colpol: dataToSend
                    }
                );
                col = dataToSend&&dataToSend.col?parseInt(dataToSend.col):0;
                pol = dataToSend&&dataToSend.pol?parseInt(dataToSend.pol):0; 
                charging = parseFloat(levelOfBattery) * 100;    
                console.log('Charging right now');
                console.log(charging);
                console.log('Condition check hit on url')
                console.log(parseInt(charging) > parseInt(col))
                console.log('Condition check hit off url')
                console.log(parseInt(charging) < parseInt(pol))
                if(parseInt(charging) > parseInt(col)){
                    console.log('Hit cutt off url');
                    hitUrlOff();
                }
                if(parseInt(charging) < parseInt(pol)){
                    console.log('Hit power on url');
                    hitUrlOn();
                }
            }, 1000);

            function hitUrlOn() {
                fetch('http://192.168.137.150/lappyonbi')
                .then(response => response.json())
                .then(data => {
                    // Handle the returned data
                    console.log(data);
                })
                .catch(error => {
                    // Handle any errors that occur
                    console.error(error);
                });
            }
            function hitUrlOff() {
                fetch('http://192.168.137.150/lappyoffbi')
                .then(response => response.json())
                .then(data => {
                    // Handle the returned data
                    console.log(data);
                })
                .catch(error => {
                    // Handle any errors that occur
                    console.error(error);
                });
            }

            ipcMain.on('form-submitted', (event, data) => {
                console.log(`Received data from HTML form: ${data}`);
                const userDataPath = electronApp.getPath('userData');
                const filePath = path.join(userDataPath, 'myData.json');
                const datarecieved = JSON.parse(data);

                const myData = { col: datarecieved.ul, pol: datarecieved.ll };

                fs.writeFile(filePath, JSON.stringify(myData), (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('Data saved to file');
                });

            });

            ipcMain.on('next-btn', (event, data) => {
                console.log(`Next button data`);
                console.log(data)
                goToPage2();
            });

            ipcMain.on('back-btn', (event, data) => {
                console.log(`Back button data`);
                console.log(data)
                goToPage1();
            });

            const goToPage2 = () => {
                window.loadFile('secondary.html')
            }
            
            // Define a function to navigate to the first page
            const goToPage1 = () => {
                window.loadFile('index.html')
            }

        })
        .then(() => {
            window.show();
        });

    return window;
}


function createSecondaryWindow() {
    secondaryWindow = new electronBrowserWindow({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        show: false,
        icon: path.join(__dirname, 'assets/iconfforbtteryapp.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: nodePath.join(__dirname, 'preload.js')
        },
        skipTaskbar: true,
        show: false
    });
  
    secondaryWindow.loadFile('secondary.html');
  
    secondaryWindow.on('closed', () => {
      secondaryWindow = null;
    });
}

electronApp.on('ready', () => {
    // Create the tray icon
    createTray();
    window = createWindow();
    setInterval(() => {
        batteryLevel().then(level => {
            levelOfBattery = level;
        });
        isCharging().then(result => {
            chargingYesOrNO = result;
        });
    }, 1000);
});

// When the window is closed, minimize it to the tray
electronApp.on('close', (event) => {
    event.preventDefault()
    window.hide()
})

electronApp.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electronApp.quit();
    }
    // event.preventDefault()
    // window.hide()
});

electronApp.on('activate', () => {
    if (electronBrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
