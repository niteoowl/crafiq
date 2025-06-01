// 이 파일은 Firebase 보안 규칙을 설정하는 방법을 보여주는 참고용 파일입니다.
// 실제로는 Firebase 콘솔에서 직접 설정해야 합니다.

/*
// Firestore 규칙
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근 가능
    match /works/{workId} {
      // 읽기는 모든 사용자에게 허용
      allow read;
      // 쓰기는 인증된 사용자만 가능
      allow create: if request.auth != null;
      // 수정 및 삭제는 작성자만 가능
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
      
      // 댓글 컬렉션
      match /comments/{commentId} {
        allow read;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
      }
    }
    
    // 사용자 컬렉션
    match /users/{userId} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

// Storage 규칙
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // 읽기는 모든 사용자에게 허용
      allow read;
      // 쓰기는 인증된 사용자만 가능
      allow write: if request.auth != null;
    }
  }
}
*/
