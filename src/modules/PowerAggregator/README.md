# Mesh Monitor

This module will listen to the advertisments from the mesh and create a graph of the network. Where possible, we will use RSSI values.

Only direct neighbours will have RSSI direct RSSI values, as well as their RSSI to their neighbours. We cannot look further up the chain.

The model for the mesh will be stored in RAM only.

It will be used as a source of truth of the connectivity of the mesh.
