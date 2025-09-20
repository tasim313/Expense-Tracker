-- Firebase Firestore security rules for full access
-- Copy these rules to your Firebase Console -> Firestore Database -> Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow full read/write access to all authenticated users
    match /{document=**} {
      allow read, write, create, update, delete: if request.auth != null;
    }
    
    // Allow unauthenticated read access for public data (optional)
    match /public/{document=**} {
      allow read: if true;
    }
  }
}

-- Firebase Storage rules (if using storage)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
