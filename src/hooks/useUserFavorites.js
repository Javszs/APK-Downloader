import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function profileFields(user) {
  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    ...(user.phoneNumber ? { phoneNumber: user.phoneNumber } : {}),
    emailVerified: user.emailVerified,
    providers: user.providerData.map((provider) => provider.providerId),
    lastSeenAt: serverTimestamp(),
  };
}

export default function useUserFavorites() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeProfile = () => {};
    const unsubscribeAuth = onAuthStateChanged(getAuth(), async (currentUser) => {
      unsubscribeProfile();
      unsubscribeProfile = () => {};
      setUser(currentUser);
      setFavorites(new Set());
      setError("");

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const profileRef = doc(db, "users", currentUser.uid);
      unsubscribeProfile = onSnapshot(profileRef, (snapshot) => {
        setFavorites(new Set(snapshot.data()?.favorites ?? []));
        setLoading(false);
      }, () => {
        setError("Your favorites could not be loaded.");
        setLoading(false);
      });

      try {
        await setDoc(profileRef, {
          ...profileFields(currentUser),
          createdAt: currentUser.metadata.creationTime ?? null,
        }, { merge: true });
        await setDoc(doc(db, "publicProfiles", currentUser.uid), {
          uid: currentUser.uid,
          displayName: currentUser.displayName ?? "",
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch {
        setError("Your profile could not be synchronized.");
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  async function toggleFavorite(appId) {
    if (!user) return false;
    const profileRef = doc(db, "users", user.uid);
    let nextFavorites;

    try {
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(profileRef);
        const currentFavorites = snapshot.data()?.favorites ?? [];
        nextFavorites = currentFavorites.includes(appId)
          ? currentFavorites.filter((favoriteId) => favoriteId !== appId)
          : [...currentFavorites, appId];
        transaction.set(profileRef, {
          ...profileFields(user),
          favorites: nextFavorites,
        }, { merge: true });
      });
      setFavorites(new Set(nextFavorites));
      setError("");
      return true;
    } catch {
      setError("Your favorite could not be saved. Please try again.");
      return false;
    }
  }

  return { user, favorites, loading, error, toggleFavorite };
}