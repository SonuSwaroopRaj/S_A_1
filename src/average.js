import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function Average() {
    const [scores, setScores] = useState([]);
    const [averagePositive, setAveragePositive] = useState(0);
    const [averageNegative, setAverageNegative] = useState(0);
    const [averageNeutral, setAverageNeutral] = useState(0);

    useEffect(() => {
        axios.get('http://localhost:5000/getscores')
        .then((response) => {
            setScores(response.data.scoresData);
            calculateAverages(response.data.scoresData); // Calculate averages after setting scores
        })
        .catch((error) => {
            console.error('Error fetching scores:', error);
        });
    }, []); // Empty dependency array ensures useEffect runs only once on component mount

    const calculateAverages = (scores) => {
        const totalPositive = scores.reduce((acc, score) => acc + score.positiveScore, 0);
        const totalNegative = scores.reduce((acc, score) => acc + score.negativeScore, 0);
        const totalNeutral = scores.reduce((acc, score) => acc + score.neutralScore, 0);
        const count = scores.length;

        setAveragePositive(totalPositive / count);
        setAverageNegative(totalNegative / count);
        setAverageNeutral(totalNeutral / count);
    };
    
    return (
        <div>
            <h3 style={{color:'white', fontWeight:'bold'}}>Community Sentiment</h3>
            
            <h2>Scores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Sentiment Text</th>
                        <th>Positive</th>
                        <th>Negative</th>
                        <th>Neutral</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((score, index) => (
                        <tr key={index}>
                            <td>{score.content}</td>
                            <td>{score.positiveScore}</td>
                            <td>{score.negativeScore}</td>
                            <td>{score.neutralScore}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Average</td>
                        <td>{averagePositive.toFixed(2)}</td>
                        <td>{averageNegative.toFixed(2)}</td>
                        <td>{averageNeutral.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}