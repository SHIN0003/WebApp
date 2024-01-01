import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Image } from 'react-bootstrap';
import axios from 'axios';

const Songs = () => {
    const { playlistId } = useParams();
    const [playlistDetails, setPlaylistDetails] = useState(null);
    const [tracks, setTracks] = useState([]);
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchAllTracks = async (url) => {
          const allTracks = [];
          let nextUrl = url;
          
          while (nextUrl) {
            const response = await axios.get(nextUrl, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            allTracks.push(...response.data.items);
            nextUrl = response.data.next; // Spotify provides the next set of items in 'next'
          }
          
          return allTracks;
        };
    
        const fetchPlaylistDetails = async () => {
          try {
            const detailsUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
            const detailsResponse = await axios.get(detailsUrl, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setPlaylistDetails(detailsResponse.data);
    
            const tracksUrl = `${detailsUrl}/tracks?limit=100`;
            const allTracks = await fetchAllTracks(tracksUrl);
            setTracks(allTracks);
          } catch (error) {
            console.error('Error fetching playlist details:', error);
          }
        };
    
        if (accessToken) {
          fetchPlaylistDetails();
        }
      }, [playlistId, accessToken]);
    
  return (
    <Container>
      {playlistDetails && (
        <>
          <Row className="align-items-center" style={{ background: 'purple', padding: '20px', borderRadius: '6px' }}>
            <Col md={4}>
              <Image src={playlistDetails.images[0].url} thumbnail />
            </Col>
            <Col md={8}>
              <h1>{playlistDetails.name}</h1>
              <p>{playlistDetails.description}</p>
            </Col>
          </Row>
          <Row className="mt-4">
            <ListGroup>
              {tracks.map((track, index) => (
                <ListGroup.Item key={track.track.id}>
                  {index + 1}. {track.track.name} by {track.track.artists.map(artist => artist.name).join(', ')}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Songs;
