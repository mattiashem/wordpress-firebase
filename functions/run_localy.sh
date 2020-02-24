#!/bin/bash
#
# Use to startup function for the app.
# Verify that the path to the key is valid and then start the interactive shell to emulate the functions.
#
#

## If does not work run as root with sudo ./run_localy.sh


#Path to your key
export GOOGLE_APPLICATION_CREDENTIALS="/home/mahe/.ssh/elino_base_wordpress_storage.json"
#firebase functions:config:get > .runtimeconfig.json



# This can be used to emulate the function locally have not used yeat
#firebase emulators:start


#To run and test interactiv
firebase functions:shell

# Now you can test you functions by calling the functionwith json
#
# newService({'name':'matte'})
#
# If you are using the payload then verify the payload is the same as sent from the app. So data will be loaded the same.
#
#
