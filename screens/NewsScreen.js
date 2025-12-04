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
const NEWS_API_KEY = "cf36cf9ed3af4dccb4d03e1d6d3435a2";
const REFRESH_INTERVAL = 5 * 60 * 1000;

const NewsScreen = ({ navigation }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim, setFadeAnim] = useState([]);

  const fetchNews = async () => {
    try {
      if (!refreshing) setLoading(true);
      const cachedArticles = await getCache("football_news");
      if (cachedArticles && !refreshing) {
        setArticles(cachedArticles);
        setLoading(false);
      }

      const today = new Date();
      const fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const query =
        '("Premier League" OR "La Liga" OR "Bundesliga" OR "Serie A" OR "Ligue 1") AND (soccer OR football) -NFL -"American football" -MLS';

      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        query
      )}&from=${fromDate}&sortBy=publishedAt&language=en&pageSize=20&excludeDomains=espn.com,usatoday.com,cbssports.com,foxnews.com,nfl.com&apiKey=${NEWS_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "ok") {
        const processed = data.articles
          .map((a) => ({
            title: a.title,
            description: a.description || "",
            url: a.url,
            image: a.urlToImage,
            source: a.source.name,
            publishedAt: new Date(a.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          }))
          .filter((a) => a.image && a.title);

        setArticles(processed);
        await setCache("football_news", processed);

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
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();

    const interval = setInterval(() => {
      fetchNews();
    }, REFRESH_INTERVAL);

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
          <Text style={styles.noMatchesText}>
            No recent news available right now. Check back soon!
          </Text>
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
  gradientBackground: { flex: 1 },
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
