import { useEffect, useState } from 'react'
import axios from 'axios'

function Home() {
  const [drinks, setDrinks] = useState([]);
  useEffect(()=>{
      axios.get('http://localhost:8081/drink/')
      .then(res => setDrinks(res))
      .catch(err => console.error(err));
  },[])
  return (
    <div>
      <ul>
        {drinks.map((drink, index)=> {
          return (
          <li key={index}>
          <h1>{drink.name}</h1>
          <h1>{drink.photo}</h1>
          <p>{drink.rating}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Home