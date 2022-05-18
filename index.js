const axios = require("axios");
const fs = require("fs");
const { notify } = require("node-notifier");
const config = require("./config.json");

// Backup data we received
function backupData(new_data) {
    new_data.forEach(slot => {
        slot.ids.split(",").forEach(id => {
            fs.appendFileSync("temp.data", `${id}\n`);
        });
    });
}

// Get the data formatted in an array line by line
function getData() {
    if (!fs.existsSync("temp.data")) return [];
    
    const data = fs.readFileSync("temp.data", "utf8");
    if (!data) return [];

    return data.trim().split("\n");
}

// Remove a line by slot id
function removeSlot(slot_id) {
    const data = getData();
    const idx = data.indexOf(slot_id);
    if (idx === -1) return;

    delete data[idx];
    fs.writeFileSync("temp.data", data.join("\n"), "utf8");
}

// Remove all slots that is not in the new data
function clearData(data_ids) {
    const data = getData();

    const diffs = data.filter(x => !data_ids.includes(x));
    diffs.forEach(diff => removeSlot(diff));

    return (diffs);
}

// Return a formatted string
function getFormattedDate(days_offset) {
    const today = new Date();
    today.setDate(today.getDate() + days_offset);

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    
    return (`${yyyy}-${mm}-${dd}`);
}

// Make the requests to get new values from the intra
async function getRemoteSlots(session, project_id, team_id, next_days, cooldown) {
    const start = getFormattedDate(0);
    const end = getFormattedDate(next_days);
    
    const headers = {
        "Cookie": `_intra_42_session_production=${session}`
    };

    const res = await axios.get(`https://projects.intra.42.fr/projects/${project_id}/slots.json?team_id=${team_id}&start=${start}&end=${end}`, { headers: headers });
    if (!res) return;
    
    let data = res.data;
    if (!data) return;
    
    // Log what we found
    console.log("\n\x1b[37mFetching slots...\x1b[0m");
    
    const data_ids = [];
    data.forEach(slot => data_ids.push(...slot.ids.split(",")));

    const old_data = getData();
    const diffs = data_ids.filter(x => !old_data.includes(x));

    // Backup the data we found
    backupData(res.data);

    setTimeout(() => {
        const data_len = clearData(data_ids).length;
        
        if (diffs.length == 0) {
            if (data_len == 0)
                console.log("\x1b[33mNo new slots were found :(\x1b[0m");
            else
                console.log(`\x1b[31m${data_len} slots has been removed or taken by another student :(\x1b[0m`);
        } else {
            console.log(`\x1b[32m--> GG! ${diffs.length} new slots found!\x1b[0m`);
            notify({
                title: `New slot${diffs.length > 1 ? "s" : ""} found`,
                message: `${diffs.length} slot${diffs.length > 1 ? "s" : ""} has been detected. Hurry up!`,
                icon: "42_logo.png",
                sound: true,
                wait: true
            })
        }

        console.log(`\x1b[37mNext update in ${cooldown} seconds...\x1b[0m\n`);
    }, 900);
}

// Start function - creating the interval
function start() {
    if (!config.session_production || config.session_production.length == 0)
        return console.error("Please add your session cookie to the config.json file. Read README.md for details.");
    if (!config.project_id || config.project_id.length == 0)
        return console.error("Please add your project id to the config.json file. Read README.md for details.");
    if (!config.team_id || config.team_id.length == 0)
        return console.error("Please add your team id to the config.json file. Read README.md for details.");

    fs.unlink("temp.data", () => {});
    console.log("\x1b[31m42 slots watcher is running... Get some rest!\x1b[0m");

    setInterval(() => {
        getRemoteSlots(config.session_production, config.project_id, config.team_id, config.nextDaysLimit || 1, config.cooldown);
    }, (config.cooldown || 30) * 1000);
}

// Launch the program
start();