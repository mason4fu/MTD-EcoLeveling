# Stage 2 Revisions

This document outlines the changes made to our original Stage 2 submission in response to TA comments.

## Changes Made

1. **UML/ER Diagram Revisions:**

   This diagram addresses the following comments which resulted in a 1 point deduction:
   
     <sup>
          
          - Cardinality should also be labeled on UML digram
          - ER/UML diagram should just represent relationships between entities. You normalize the schema.
     </sup>

   It appears that the previous diagram was mistaken for a UML diagram due to different notations used in the diagram as opposed to what was taught in class. The new diagram reflects what we were taught in class and meets all the requirements.

   You can view the diagram in Page 2 of the revised document or down below:
     
     ![Revised ER Diagram](images/er_diagram_revised.png)

2. **Normalization Revision:**

     For the normalization aspect of the original document, the following comments were made that resulted in a 1 point deduction:
   
     <sup>
          
          Calculating information for Relation UserLevel having attributes: USERID, XP, LEVEL, TITLE, UPDATED.
          Given input functional dependencies: USERID → XP,LEVEL,TITLE,UPDATED; XP → LEVEL,TITLE.
          These should be the new relations.
          R0(XP, USERID, UPDATED) having FD(s): USERID → XP; USERID → UPDATED.
          R1(XP, LEVEL, TITLE) having FD(s): XP → LEVEL; XP → TITLE.
     </sup>

     This fix was added in Page 4 of the revised document and also shown below:
   
    - **Original Functional Dependencies for UserLevel:**  
     - `User_ID → TotalXP, Current_Level, Title, Updated_At`  
     - `Total_XP → Current_Level, Title`
   - **Revised Relations:**  
     - **User_Level(Total_XP, User_ID, Updated_At)** with FDs:  
       - `User_ID → Total_XP`  
       - `User_ID → Updated_At`
     - **Level_Tracking(Total_XP, Current_Level, Title)** with FDs:  
       - `Total_XP → Current_Level`  
       - `Total_XP → Title`

These two fixes address all the comments received in the Stage 2 submission and they are both reflected in the Stage 2 revised document: [Stage 2_ Conceptual and Logical Database Design Revised.pdf](https://github.com/cs411-alawini/sp25-cs411-team099-BigBallers/blob/main/doc/Stage%202_%20Conceptual%20and%20Logical%20Database%20Design%20Revised.pdf)

