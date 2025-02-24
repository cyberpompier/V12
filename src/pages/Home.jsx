import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import './Home.css';

function Home() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaserne, setEditCaserne] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editFirstname, setEditFirstname] = useState('');
  const [editName, setEditName] = useState('');
  const [editUserPhoto, setEditUserPhoto] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const profileData = doc.data();
            setProfile(profileData);
            setEditCaserne(profileData.Caserne || '');
            setEditGrade(profileData.Grade || '');
            setEditFirstname(profileData.firstname || '');
            setEditName(profileData.name || '');
            setEditUserPhoto(profileData.userPhoto || '');
          } else {
            setProfile(null);
            setEditCaserne('');
            setEditGrade('');
            setEditFirstname('');
            setEditName('');
            setEditUserPhoto('');
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: displayName });

      await addDoc(collection(db, 'users'), {
        uid: newUser.uid,
        email: newUser.email,
        displayName: displayName
      });

      setUser(newUser);
      setProfile({ uid: newUser.uid, email: newUser.email, displayName: displayName });
      setEmail('');
      setPassword('');
      setDisplayName('');
      setIsSignUp(false);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'users', querySnapshot.docs[0].id);
        const updateData = {};
        if (editCaserne !== '') updateData.Caserne = editCaserne;
        if (editGrade !== '') updateData.Grade = editGrade;
        if (editFirstname !== '') updateData.firstname = editFirstname;
        if (editName !== '') updateData.name = editName;
        if (editUserPhoto !== '') updateData.userPhoto = editUserPhoto;

        await updateDoc(docRef, updateData);

        // Update local profile state
        setProfile(prevState => ({
          ...prevState,
          Caserne: editCaserne || prevState.Caserne,
          Grade: editGrade || prevState.Grade,
          firstname: editFirstname || prevState.firstname,
          name: editName || prevState.name,
          userPhoto: editUserPhoto || prevState.userPhoto
        }));

        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleEditProfileClick = () => {
    setIsEditing(true);
  };

  return (
    <main className="main-content">
      

      {user ? (
        <div className="profile-container">
          <img
            src={profile?.userPhoto}
            alt="Profile"
            className="profile-photo"
          />
          <p>Welcome, {profile?.displayName || user.email}!</p>
          <button onClick={handleSignOut} className="auth-button">Sign Out</button>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="auth-form">
              <input
                type="text"
                placeholder="Caserne"
                value={editCaserne}
                onChange={(e) => setEditCaserne(e.target.value)}
                className="auth-input"
              />
              <input
                type="text"
                placeholder="Grade"
                value={editGrade}
                onChange={(e) => setEditGrade(e.target.value)}
                className="auth-input"
              />
              <input
                type="text"
                placeholder="First Name"
                value={editFirstname}
                onChange={(e) => setEditFirstname(e.target.value)}
                className="auth-input"
              />
              <input
                type="text"
                placeholder="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="auth-input"
              />
              <input
                type="text"
                placeholder="User Photo URL"
                value={editUserPhoto}
                onChange={(e) => setEditUserPhoto(e.target.value)}
                className="auth-input"
              />
              <button type="submit" className="auth-button">Update Profile</button>
              <button onClick={() => setIsEditing(false)} className="auth-button">Cancel</button>
            </form>
          ) : (
            <div>
              <button onClick={handleEditProfileClick} className="auth-button">Edit Profile</button>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-container">
          <button onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle-button">
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="auth-form">
            {isSignUp && (
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="auth-input"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
            <button type="submit" className="auth-button">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
          </form>
        </div>
      )}
    </main>
  );
}

export default Home;
