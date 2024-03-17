import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Loader from './loader';

const AzureSentimentAnalysis = () => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [listening, setListening] = useState(false);
    const [sentiment, setSentiment] = useState(null);
    const [positiveScore, setPositiveScore] = useState(null);
    const [negativeScore, setNegativeScore] = useState(null);
    const [neutralScore, setNeutralScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [backendResponse, setBackendResponse] = useState();
    let recognition = null;
    const fileInputRef = useRef(null);

    const analyzeSentiment = async () => {
        setLoading(true);
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const fileContent = event.target.result;
                    const response = await axios.post(
                        'https://eastus.api.cognitive.microsoft.com/text/analytics/v3.0/sentiment',
                        {
                            documents: [
                                {
                                    id: '1',
                                    text: fileContent,
                                },
                            ],
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Ocp-Apim-Subscription-Key': '9f54ecd90376405587302221386854f8',
                            },
                        }
                    );
                    handleSentimentResponse(response.data.documents[0]);
                } catch (error) {
                    console.error('Error analyzing sentiment:', error);
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsText(file);
        } else if (text.trim() !== '') {
            try {
                const response = await axios.post(
                    'https://eastus.api.cognitive.microsoft.com/text/analytics/v3.0/sentiment',
                    {
                        documents: [
                            {
                                id: '1',
                                text: text,
                            },
                        ],
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Ocp-Apim-Subscription-Key': '9f54ecd90376405587302221386854f8',
                        },
                    }
                );
                handleSentimentResponse(response.data.documents[0]);
                // Send sentiment analysis data to backend
            } catch (error) {
                console.error('Error analyzing sentiment:', error);
            } finally {
                setLoading(false);
            }
        } else {
            console.error('No text or file uploaded.');
        }
    };

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
        fileInputRef.current.value = null;
    };

    const handleSentimentResponse = async (document) => {
        setSentiment(document.sentiment);
        const confidenceScores = document.confidenceScores;
        setPositiveScore(confidenceScores.positive);
        setNegativeScore(confidenceScores.negative);
        setNeutralScore(confidenceScores.neutral);
        try {
            const backendResponse = await axios.post(
                'http://localhost:5000/analyze-sentiment',
                {
                    content: text,
                    positiveScore: confidenceScores.positive*100,
                    negativeScore: confidenceScores.negative*100,
                    neutralScore: confidenceScores.neutral*100,
                }
            );
            setBackendResponse(backendResponse.data); // Store backend response
        } catch (error) {
            console.error('Error sending sentiment analysis data to backend:', error);
        }
    };

    const getSentimentEmoji = (sentiment) => {
        if (sentiment === 'Positive') {
            return '😊';
        } else if (sentiment === 'Neutral') {
            return '😐';
        } else if (sentiment === 'Negative') {
            return '😞';
        } else {
            return '';
        }
    };

    const getSentimentScorePercentage = (score) => {
        if (score) {
            return (score * 100).toFixed(2);
        }
        return '';
    };

    const handleVoiceInput = () => {
        recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setText(transcript);
        };
        recognition.start();
        setListening(true);
    };

    const clearText = () => {
        setText('');
    };

    return (
        <div>
            <div className='row'>
                <div className='col-md-6 hentai'>
                    <div className='col-md-12'>
                        <h2 className='mt-5'>AZURE SENTIMENTAL ANALYSIS</h2>
                        <textarea
                            className='mt-3'
                            rows="4"
                            cols="50"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="  Enter text for sentiment analysis..."
                        ></textarea>
                    </div>
                    <input className='rajini' type="file" onChange={handleFileChange} ref={fileInputRef} />
                    {file && (
                        <span className='btn' onClick={handleRemoveFile}>Remove File</span>
                    )}
                    <div className='row mt-5'>
                        <div className='col-md-4'>
                            <span className="btn" onClick={handleVoiceInput}>Start Voice Input</span>
                        </div>
                        <div className='col-md-4'>
                            <span className='btn' onClick={analyzeSentiment}>Analyze Sentiment</span>
                        </div>
                        <div className='col-md-4'>
                            <span className='btn' onClick={clearText}>Clear Text</span>
                        </div>
                    </div>
                </div>
                <div className='col-md-6 hentai'>
                <center><div style={{marginBottom:'100px'}}>{loading && <Loader />}</div></center>
                {sentiment && (
                    <div className='chill'>
                        <h3>Sentiment: {sentiment} {getSentimentEmoji(sentiment)}</h3><br/>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                            <div style={{ width: '100px' }}>
                            <CircularProgressbar
                                value={positiveScore * 100}
                                text={`${(positiveScore * 100).toFixed(2)}%`}
                                styles={buildStyles({
                                    trailColor: '#f3f3f3', // Background color
                                    pathColor: '#00ff00', // Progress color
                                })}
                            />
                            <p>Positive Score</p>
                            </div>
                            <div style={{ width: '100px' }}>
                            <CircularProgressbar
                                value={neutralScore * 100}
                                text={`${(neutralScore * 100).toFixed(2)}%`}
                                styles={buildStyles({
                                    trailColor: '#f3f3f3', // Background color
                                    pathColor: 'yellow', // Progress color
                                })}
                            />
                            <p>Neutral Score</p>
                            </div>
                            <div style={{ width: '100px' }}>
                            <CircularProgressbar
                                value={negativeScore * 100}
                                text={`${(negativeScore * 100).toFixed(2)}%`}
                                styles={buildStyles({
                                    trailColor: '#f3f3f3', // Background color
                                    pathColor: '#ff0000', // Progress color
                                })}
                            />
                            <p>Negative Score</p>
                            </div>
                        </div>
                        <div className="bar-graph-container" style={{ display: 'flex' }}>
                            <div className="bar-graph positive" style={{ width: `${positiveScore * 100}%` }}></div>
                            <div className="bar-graph neutral" style={{ width: `${neutralScore * 100}%` }}></div>
                            <div className="bar-graph negative" style={{ width: `${negativeScore * 100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
     </div>
    );
};

export default AzureSentimentAnalysis;