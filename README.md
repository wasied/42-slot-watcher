# 42_slot_watcher
A simple node.js corrections slots watcher for 42, **only on Windows** atm.  

### What is this
I was bored of having to refresh the page every 10 seconds to find for correction slots and hoping to be the first one to claim it.  
So I made Javascript do it for me :)  
You will receive desktop notifications as soon as new slots has been detected.

### Installation
1. Clone the repository : ``git clone https://github.com/MaaxIT/42_slot_watcher``
2. Open the **config.json** file and your own values **(see below for configuration steps)**
3. Run ``node .`` and here you go, you can take a rest!

### Configuration
1. Connect to the intra, press F12 to open your console, go the "Application" tab and scroll down to the "Cookies" category.
2. Open your cookies from the 42 intra and copy the value of the cookie with the name ``_intra_42_session_production``. Put in into the config file at **session_production**.
3. Then, go to your project and go to the menu where you can see available corrections slots for your project. In the URL, you can see 2 important values :  
--> Use this link as an example: https://projects.intra.42.fr/projects/42cursus-push_swap/slots?team_id=4134397  
-->> **42cursus-push_swap** is your **project_id**  
-->> **4134397** is your **team_id**  

4. You don't have to change other values.
```json
{
    "session_production": "your_session_production",
    "project_id": "project_string_id",
    "team_id": "team_number_id",
    "cooldown": 30,
    "nextDaysLimit": 1
}
```
