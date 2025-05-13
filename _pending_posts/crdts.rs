pub trait Lattice {
    /// Merge `other` into the `self` lattice.
    ///
    /// This operation must be associative, commutative, and idempotent.
    ///
    /// Returns `true` if `self` changed, `false` otherwise.
    fn merge(&mut self, other: Self) -> bool;
}

pub struct SetUnion<HashSet>(pub HashSet);

impl<S> Merge for SetUnion<S> {
    fn merge(&mut self, other: Self) -> bool {
        let old_len = self.0.len();
        self.0.extend(other.0);
        self.0.len() > old_len
    }
}

impl<S> Update for SetUnion<HashSet<S>> {
    fn update(&mut self) -> bool {
        let old_len = self.0.len();
        self.0.extend(other.0);
        self.0.len() > old_len
    }
}

/// Naive lattice compare, based on the [`Merge::merge`] function.
#[sealed]
pub trait NaiveLatticeOrd<Rhs = Self>
where
    Self: Clone + Merge<Rhs> + Sized,
    Rhs: Clone + Merge<Self>,
{
    /// Naive compare based on the [`Merge::merge`] method. This method can be very inefficient;
    /// use [`PartialOrd::partial_cmp`] instead.
    ///
    /// This method should not be overridden.
    fn naive_cmp(&self, other: &Rhs) -> Option<Ordering> {
        let mut self_a = self.clone();
        let other_a = other.clone();
        let self_b = self.clone();
        let mut other_b = other.clone();
        match (self_a.merge(other_a), other_b.merge(self_b)) {
            (true, true) => None,
            (true, false) => Some(Less),
            (false, true) => Some(Greater),
            (false, false) => Some(Equal),
        }
    }
}
