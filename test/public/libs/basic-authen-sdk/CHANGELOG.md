# Basic Authen SDK - NodeJS CHANGE LOG
----
#
---
### version 1.0.0
---
*29 June 2018*
*   ##### Server Authentication
    * init loginByB2B
	* re-designed hummus

### version 1.0.1
*27 August 2018*
*   ##### Client Authentication
    * init appAuthenV1 - appAuthenV2
	* re-designed hummus
	* Pass QA 27 August 2018

### version 1.0.2 Releases Config
*06 September 2018*
*   ##### Client Authentication
    * Edit ClientAuthenticationFile
      - urlObtain type string => urlObtain type object
      EX : 
      "urlObtain":{
	        "version1":"url",
	        "version2":"url"
	    }
	* Edit Logic select url request to Backend