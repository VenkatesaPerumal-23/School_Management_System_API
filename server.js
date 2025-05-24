const express= require('express'); 
const db = require('./db'); 
require('dotenv').config(); 
const app=express(); 
app.use(express.json()); 

// add new school API 

app.post('/addSchool', (req,res)=>{

    const {name,address,latitude,longitude}=req.body; 
    if(!name || !address || latitude===undefined || longitude===undefined){
        return res.status(400).json({error:'Please provide all required fields'}); 
    } 

    if(typeof name!=='string' || typeof address!=='string'){
        return res.status(400).json({error:'Name and Address must be strings'});
    } 

    if(isNaN(latitude) || isNaN(longitude)){
        return res.status(400).json({error:'Latitude and Longitude should be numbers'});
    } 

    const query=`INSERT INTO schools (name,address,latitude,longitude) VALUES (?,?,?,?)`;
    db.query(query,[name,address,latitude,longitude],(err,result)=>{
        if(err){
            console.error("Error inserting data:", err.message);
            return res.status(500).json({error:'Database error'}); 
        } 
        res.status(201).json({message:'School added successfully',schoolId:result.insertId}); 
    });
});

// get all schools based on proximity API 

app.get('/listSchools', (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required' });
  }

  db.query('SELECT * FROM schools', (err, results) => {
    if (err) {
      console.error("Error fetching schools:", err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const toRad = (val) => (val * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const sortedSchools = results
      .map(school => ({
        ...school,
        distance: getDistance(userLat, userLon, school.latitude, school.longitude)
      }))
      .sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  });
});



const PORT=3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});