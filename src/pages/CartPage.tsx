import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import EmptyCart from '../components/EmptyCart';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import FormCard from '../components/FormCard';
import Button from '../components/Button';
import './CartPage.css';

const CartPage = () => {
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount } = useCart();

  if (!user) {
    return (
      <EmptyCart
        title="Shopping Cart"
        subtitle="Please sign in to view your cart"
        linkTo="/login"
        linkText="Sign In to Continue"
        testId="cart-page"
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyCart
        title="Your Cart"
        subtitle="Your cart is empty. Start shopping to add items!"
        linkTo="/products"
        linkText="Continue Shopping"
        testId="cart-page"
      />
    );
  }

  return (
    <FormCard
      title={`Your Cart (${getItemCount()} items)`}
      subtitle="Review your items and proceed to checkout"
    >
      <div data-testid="cart-page">
        {/* Clear Cart Button */}
        <div className="cart-clear-button-container">
          <Button
            onClick={clearCart}
            variant="danger"
            size="md"
            data-testid="clear-cart-button"
          >
            Clear Cart
          </Button>
        </div>

        {/* Cart Items */}
        <div className="cart-items-container">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        {/* Checkout Section */}
        <CartSummary 
          total={getTotal()}
          itemCount={getItemCount()}
        />
      </div>
    </FormCard>
  );
};

export default CartPage;