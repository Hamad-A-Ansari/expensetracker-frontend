import { View, Text, Alert, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { API_URL } from '../../constants/api';
import { styles } from '../../assets/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const CATEGORIES =[
  { id: "food", name: "Food & Drinks", icon: "fast-food" },
  { id: "shopping", name: "Shopping", icon: "cart" },
  { id: "transportation", name: "Transportation", icon: "car" },
  { id: "entertainment", name: "Entertainment", icon: "film" },
  { id: "bills", name: "Bills", icon: "receipt" },
  { id: "income", name: "Income", icon: "cash" },
  { id: "other", name: "Other", icon: "ellipsis-horizontal" },
];

const CreateScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title) {
      Alert.alert("Error" ,"Please enter transaction title");
      return;
    }
    if (!amount) {
      Alert.alert("Error", "Please enter transaction amount");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const formatAmount = isExpense ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));

      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          title,
          amount: formatAmount,
          category: selectedCategory,
          isExpense,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ||'Failed to create transaction');
      }

      Alert.alert('Success', 'Transaction created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert("Error", error.message || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} >New Transaction</Text>
        <TouchableOpacity 
          style = {[styles.saveButtonContainer, isLoading && styles.disabledButton]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
          { !isLoading && <Ionicons name='checkmark' size={18} color={COLORS.primary} /> }
        </TouchableOpacity>
      </View>

      {/* FORM */}
      <View style={styles.card}>
        <View style={styles.typeSelector}>
          {/* EXPENSE SELECTOR */}
          <TouchableOpacity style={[styles.typeButton, isExpense && styles.typeButtonActive]} onPress={() => setIsExpense(true)}>
            <Ionicons
              name='arrow-down-circle'
              size={22}
              color={isExpense ? COLORS.white : COLORS.expense}
              style={styles.typeIcon}
            />
            <Text style={[styles.typeButtonText, isExpense && styles.typeButtonTextActive]}>Expense</Text>
          </TouchableOpacity>

          {/* INCOME SELECTOR */}
          <TouchableOpacity style={[styles.typeButton, !isExpense && styles.typeButtonActive]} onPress={() => setIsExpense(false)}>
            <Ionicons
              name='arrow-up-circle'
              size={22}
              color={!isExpense ? COLORS.white : COLORS.expense}
              style={styles.typeIcon}
            />
            <Text style={[styles.typeButtonText, !isExpense && styles.typeButtonTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* AMOUNT CONTAINER */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType='numeric'
            value={amount}
            placeholder='0.00'
            placeholderTextColor={COLORS.textLight}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
          />
        </View>

        {/* TITLE INPUT */}
        <View style={styles.inputContainer}>
          <Ionicons name='create-outline' size={22} color={COLORS.textLight} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            value={title}
            placeholder='Transaction Title'
            placeholderTextColor={COLORS.textLight}
            onChangeText={(text) => {
              const capitalized =
                text.charAt(0).toUpperCase() + text.slice(1);
              setTitle(capitalized);
            }}
          />
        </View>

        {/* CATEGORIES TITLE */}
        <Text style={styles.sectionTitle}>
          <Ionicons name='pricetag-outline' size={16} color={COLORS.text}/> Category
        </Text>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Ionicons name={category.icon} size={20} color={selectedCategory === category.name ? COLORS.white : COLORS.text} />
              <Text style={[styles.categoryButtonText, selectedCategory === category.name && styles.categoryButtonTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      { isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

    </View>
  )
}

export default CreateScreen;