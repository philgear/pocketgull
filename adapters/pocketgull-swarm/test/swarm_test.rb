# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/pocketgull/swarm"

class SwarmTest < Minitest::Test
  def test_consensus_evaluation
    res = Pocketgull::Swarm::ConsensusEngine.evaluate_consensus(
      symptoms: ["fatigue", "insomnia", "brain fog"],
      vitals: { hr: 78, bp: "125/82" }
    )

    assert_equal 88.5, res[:consensus_score]
    assert_equal 3, res[:agreements].size
    assert_equal 2, res[:divergences].size
    assert_equal 3, res[:phased_plan].size
  end
end
