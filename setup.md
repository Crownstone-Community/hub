
hub is set up through the firmware via the uart echo I suppose.

- receive hub token and sphereId via uart. 
- add hub token and hubId to database.
- login and get hub data
- post local ips to cloud
- download crownstones in sphere (local in memory cache)
- download user data and put in local db

- start SSE server with access token
    - SSE events to listen to:
        - remote switch
        - crownstones changed