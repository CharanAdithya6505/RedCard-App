import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  Dimensions,
  RefreshControl,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { setCache, getCache } from "../utils/cache";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.9;

const GNEWS_KEY = "49911c31e3d5302ae0e5740877008eb6";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const NewsScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim, setFadeAnim] = useState([]);

  const fetchNews = async () => {
    try {
      if (!refreshing) setLoading(true);

      // Load cached news immediately
      const cached = await getCache("football_news");
      if (cached) setArticles(cached);

      // GNews API football query
      const url = `https://gnews.io/api/v4/search?q=football OR soccer OR premier league OR la liga OR bundesliga&lang=en&country=gb&max=30&apikey=${GNEWS_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.articles) {
        const processed = data.articles.map((a) => ({
          title: a.title,
          description: a.description || "",
          url: a.url,
          image: a.image,
          source: a.source?.name || "Unknown",
          publishedAt: new Date(a.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }));

        setArticles(processed);
        await setCache("football_news", processed);

        // Animations
        const anims = processed.map(() => new Animated.Value(0));
        setFadeAnim(anims);

        anims.forEach((a, idx) => {
          setTimeout(() => {
            Animated.timing(a, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start();
          }, idx * 120);
        });
      }
    } catch (e) {
      console.log("API failed → using cache only");
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#d7fc5a" />
        </View>
      );
    }

    if (articles.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noMatchesText}>No news available</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={{ marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 150 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#d7fc5a"]}
            tintColor="#d7fc5a"
          />
        }
      >
        {articles.map((article, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => Linking.openURL(article.url)}
            activeOpacity={0.75}
          >
            <Animated.View
              style={[styles.newsCard, { opacity: fadeAnim[i] || 1 }]}
            >
              <Image source={{ uri: article.image }} style={styles.newsImage} />

              <View style={styles.cardContent}>
                <Text style={styles.title}>{article.title}</Text>

                <Text style={styles.desc} numberOfLines={3}>
                  {article.description}
                </Text>

                <View style={styles.footerRow}>
                  <Text style={styles.source}>{article.source}</Text>
                  <Text style={styles.date}>{article.publishedAt}</Text>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={styles.gradientBackground}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Top News</Text>
      </View>

      {renderContent()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  headerContainer: {
    marginTop: 65,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMatchesText: {
    color: "#fff",
    fontSize: 18,
  },
  newsCard: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
    marginBottom: 25,
    alignSelf: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  newsImage: {
    width: "100%",
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  desc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  source: {
    color: "#d7fc5a",
    fontSize: 13,
    fontWeight: "600",
  },
  date: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
});

export default NewsScreen;
