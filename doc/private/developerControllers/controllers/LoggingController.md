# LoggingController
This is made to interact with log files without using SSH.

#### GET: /availableLogFiles
> `admin authorization required`
>
>Get a list of log files you can download.

#### DELETE: /deleteAllLogs
> `admin authorization required`
>
>Delete all log files


#### GET: /downloadLogFile
> `admin authorization required`
>
>Download a file you found in the list


#### GET: /individualLogLevels
> `admin authorization required`
>
>See which log levels can be changed

#### POST: /individualLogLevels
> `admin authorization required`
>
>Change the log level of a logger.

#### DELETE: /individualLogLevels
> `admin authorization required`
>
>Remove custom override to an individual logger's log level
>